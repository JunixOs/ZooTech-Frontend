import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'zt-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  placeholder = input.required<string>();
  search = output<string>();

  term = signal('');

  onInput(value: string): void {
    this.term.set(value);
  }

  onSearch(): void {
    this.search.emit(this.term());
  }

  onClear(): void {
    this.term.set('');
    this.search.emit('');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
    if (event.key === 'Escape') {
      this.onClear();
    }
  }
}
