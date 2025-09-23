import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth_Service } from '../services/auth.service';
import { Navigation_Service } from '../services/navigation.service';


export const auth_guard: CanActivateFn = (route, state) => {
  const _auth_service = inject(Auth_Service)
  const _navigation_service = inject(Navigation_Service)
  
  if(_auth_service.isAuthenticated()){
    return true;
  }else{
    _navigation_service.navigate_to_link('auth/login')
    return false;
  }

};
