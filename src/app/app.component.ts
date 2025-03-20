import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { UserStorageService } from './auth/auth-services/storage-service/user-storage.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isCustomerLoggedIn: boolean = UserStorageService.isCustomerLoggedIn();
  isAdminLoggedIn: boolean = UserStorageService.isAdminLoggedIn();
  showFooter: boolean = true;  
  isHomePage: boolean = false; 
  hideContent: boolean = false; // Hide content on all pages except home

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isHomePage = event.urlAfterRedirects === '/';
      
      // Hide content on all pages except the home page
      this.hideContent = !this.isHomePage;

      // If logged in, footer should still be hidden
      if (this.isCustomerLoggedIn || this.isAdminLoggedIn) {
        this.showFooter = this.isHomePage; // Show footer only on the home page
      } else {
        this.showFooter = this.isHomePage; // Footer is visible only on home
      }

      this.updateLoginStatus();
    });
  }

  updateLoginStatus() {
    this.isCustomerLoggedIn = UserStorageService.isCustomerLoggedIn();
    this.isAdminLoggedIn = UserStorageService.isAdminLoggedIn();
  }

  logout() {
    UserStorageService.signOut();
    this.router.navigateByUrl('login');
  }
}
