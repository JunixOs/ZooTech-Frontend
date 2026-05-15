import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Header } from "../header/header";
import { Sidebar } from "../sidebar/sidebar";
import { Footer } from "../footer/footer";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'zt-shell',
  imports: [Header, Sidebar, Footer, RouterOutlet],
  templateUrl: './shell.html',
  //styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell { }
