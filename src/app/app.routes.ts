import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PageNotfoundComponent } from './main-pages/page-notfound.component';
import { AppComponent } from './app.component';
import { PageMainComponent } from './main-pages/page-main.component';

const routes: Routes = [
  { path: '', component: AppComponent, pathMatch: "full",
    children: [
      {path: '', component: PageMainComponent}
    ]
  },
  { path: '**', component: PageNotfoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // {enableTracing: true})],
  exports: [RouterModule]
})
export class AppRoutingModule{}
