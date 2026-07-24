import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-search-input',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  placeholder = input.required<string>();
  value = input('');
  search = output<string>();
  termChange = output<string>();
  focusChange = output<boolean>();

  term = signal('');

  private readonly syncValue = effect(() => {
    this.term.set(this.value());
  });

  onInput(value: string): void {
    this.term.set(value);
    this.termChange.emit(value);
  }

  onSearch(): void {
    this.search.emit(this.term());
  }

  onClear(): void {
    this.term.set('');
    this.termChange.emit('');
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
