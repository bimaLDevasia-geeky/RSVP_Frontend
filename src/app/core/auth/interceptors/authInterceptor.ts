import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { catchError, filter,  switchMap, take, throwError } from "rxjs";

export const authInterceptor:HttpInterceptorFn = (req,next) => {
    const authService = inject(AuthService);
    const token = authService.getAccessToken();



    const addTokenHeader = (request: any, token: string) => {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  let authreq = req;

    if(token){
        authreq = addTokenHeader(req,token);
    }

    if(req.url.includes('/refresh')){
        return next(authreq);
    }

    return next(authreq).pipe(

        catchError((error: HttpErrorResponse)=>{

            if(error.status ===401){

                if(req.url.includes('/refresh')){
                    authService.logout();
                    return throwError(()=>new Error('Unauthorized'));
                }
                if(!authService.isRefreshing){
                    authService.isRefreshing = true;
                    authService.updateTokenStream(null);

                    return authService.refresh().pipe(
                        switchMap((response)=>{
                            authService.updateTokenStream(response.token);
                            return next(addTokenHeader(req,response.token));
                        }),
                        catchError((err)=>{
                            authService.isRefreshing = false;
                            authService.logout();
                            return throwError(()=>err);
                        })
                    );

                                
                } else {
                    return authService.refreshToken$.pipe(
                        filter(token=>token!==null),
                        take(1),
                        switchMap((token)=>{
                            return next(addTokenHeader(req,token!));
                        })
                    );
                }
            }
            return throwError(()=>error);

        })


    );
        
    

}