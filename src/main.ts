import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {NavegacionComponent} from './app/navegacion/navegacion.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
bootstrapApplication(NavegacionComponent, appConfig)
  .catch((err) => console.error(err));