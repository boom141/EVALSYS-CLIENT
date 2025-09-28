import { Routes } from '@angular/router';
import { OverviewComponent } from './admin/features/overview/overview.component';
import { FacultyComponent } from './admin/features/faculty/faculty.component';
import { AdminComponent } from './admin/admin.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { LoginComponent } from './authentication/features/login/login.component';
import { auth_guard } from './core/guards/auth.guard';
import { StudentComponent } from './student/student.component';

export const routes: Routes = [
    {
        path: 'admin', component: AdminComponent, canActivate: [auth_guard], children: [
            {path: "overview", component: OverviewComponent},
            {path: "faculty", component: FacultyComponent }
        ]
    },

    {
        path: 'student', component: StudentComponent
    },

    {
        path: 'auth', component: AuthenticationComponent, children:[
            {path: 'login', component: LoginComponent}
        ]
    },
    { path: '**', redirectTo: 'auth/login', pathMatch: 'full' },
    
];
