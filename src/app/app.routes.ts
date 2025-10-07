import { Routes } from '@angular/router';
import { OverviewComponent } from './admin/features/overview/overview.component';
import { FacultyComponent } from './admin/features/faculty/faculty.component';
import { AdminComponent } from './admin/admin.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { LoginComponent } from './authentication/features/login/login.component';
import { auth_guard } from './core/guards/auth.guard';
import { StudentComponent } from './student/student.component';
import { FacultyMainComponent } from './faculty-main/faculty-main.component';

export const routes: Routes = [
    {
        path: 'admin', component: AdminComponent, children: [
            {path: "overview", component: OverviewComponent},
            {path: "departments", component: FacultyComponent }
        ]
    },

    {
        path: 'student', component: StudentComponent
    },

    
    {
        path: 'faculty-main', component: FacultyMainComponent, canActivate: [auth_guard]
    },

    {
        path: 'auth', component: AuthenticationComponent, children:[
            {path: 'login', component: LoginComponent}
        ]
    },
    { path: '**', redirectTo: 'auth/login', pathMatch: 'full' },
    
];
