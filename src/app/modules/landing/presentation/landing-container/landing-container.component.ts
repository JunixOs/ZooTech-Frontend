import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'zt-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-container.component.html',
  styleUrl: './landing-container.component.css'
})
export class LandingComponent {}
