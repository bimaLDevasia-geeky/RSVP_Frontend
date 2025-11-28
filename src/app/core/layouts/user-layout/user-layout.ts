import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "../../../shared/navbar/navbar";

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, Navbar],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.scss',
})
export class UserLayout {

}
