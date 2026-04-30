import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[ztHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() ztHighlight = '#e2e8f0';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.ztHighlight);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
