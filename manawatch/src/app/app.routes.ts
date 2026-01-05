import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
     {
        path: '',
        pathMatch: 'full',
        loadComponent: () => {
            return Home
        }
    },
    {
        path: 'home',
        loadComponent: () => {
            return Home
        }
    },
];
