import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { NgxSonnerToaster } from "ngx-sonner";
import { NgxSpinnerComponent } from "ngx-spinner";
@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgxSonnerToaster,
    NgxSpinnerComponent,
  ],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {}
