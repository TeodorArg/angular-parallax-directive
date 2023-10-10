import {
  Directive,
  Input,
  ElementRef,
  HostListener,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Directive({
  selector: '[appParallax]',
})
export class ParallaxDirective implements AfterViewInit {
  public scroll$ = new Subject();
  @Input() public ratio = 0.1; // min -0.5, max 0.5
  public initialTop = 0;
  public screenHeightFactor = 0;
  public positionElement = 0;
  public parallaxStart = false; // Для проверки на начало страницы, чтобы был плавный эффект
  @Input() public diagonal = false; // Для движения по диагонали
  @Input() public diagonal_rev = false;
  constructor(private eleRef: ElementRef, private cd: ChangeDetectorRef) {}

  public ngAfterViewInit() {
    this.initialTop =
      this.eleRef.nativeElement.getBoundingClientRect().top +
      Math.floor(window.pageYOffset);
    this.getScreenSize();
    this.scrolling();
    this.cd.detectChanges();
  }

  @HostListener('window: scroll')
  onWindowScroll() {
    this.scroll$.next(true);
  }

  public scrolling() {
    this.scroll$.pipe(throttleTime(5)).subscribe(() => {
      // Element position
      this.positionElement =
        (window.pageYOffset - this.initialTop) * this.ratio +
        this.screenHeightFactor;

      // The area in which parallax will work
      if (window.pageYOffset < window.innerHeight && window.pageYOffset >= 1) {
        this.parallaxStart = window.pageYOffset >= this.initialTop / 6;
      } else if (window.pageYOffset >= window.innerHeight) {
        this.parallaxStart =
          window.pageYOffset >=
          this.initialTop -
            this.eleRef.nativeElement.getBoundingClientRect().top * 2;
      } else {
        this.parallaxStart = false;
        this.eleRef.nativeElement.style = `transform: translateХ(0) translateY(0); transition: transform 2s linear 0s;`;
      }
      const parallaxEnd =
        window.pageYOffset <
        this.initialTop +
          window.innerHeight / 2 +
          this.eleRef.nativeElement.getBoundingClientRect().bottom;

      // Add styles to element
      if (this.parallaxStart && parallaxEnd) {
        if (this.diagonal) {
          this.eleRef.nativeElement.style = `transform:
            translateX(${-this.positionElement / 1.5}px) translateY(${
            this.positionElement
          }px);
            transition: transform .65s linear 0s;`;
        } else if (this.diagonal_rev) {
          this.eleRef.nativeElement.style = `transform:
            translateX(${this.positionElement / 1.5}px) translateY(${-this
            .positionElement}px);
            transition: transform .65s linear 0s;`;
        } else {
          this.eleRef.nativeElement.style = `transform: translateY(${this.positionElement}px); transition: transform .65s linear 0s;`;
        }
      }
    });
  }

  public getScreenSize() {
    this.screenHeightFactor = (window.innerHeight * this.ratio) / 1.75;
  }
}
