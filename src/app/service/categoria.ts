import { Injectable } from '@angular/core';
import { ICategoria } from '../model/categoria';
import { Observable } from 'rxjs';
import { IPage } from '../model/plist';
import { HttpClient } from '@angular/common/http';
import { serverURL } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  constructor(private oHttp: HttpClient) { }

  getPage(page: number, rpp: number, order: string = '', direction: string = ''): Observable<IPage<ICategoria>> {
    let url = serverURL + `/categoria?page=${page}&size=${rpp}`;
    if (order && direction) {
      url += `&sort=${order},${direction}`;
    }
    return this.oHttp.get<IPage<ICategoria>>(url);
  }

  // get(id: number): Observable<ICategoria> {
  //   return this.oHttp.get<ICategoria>(serverURL + '/categoria/' + id);
  // }

  // create(articulo: Partial<ICategoria>): Observable<number> {
  //   return this.oHttp.post<number>(serverURL + '/categoria', articulo);
  // }

  // update(articulo: Partial<ICategoria>): Observable<number> {
  //   return this.oHttp.put<number>(serverURL + '/categoria', articulo);
  // }

  // delete(id: number): Observable<number> {
  //   return this.oHttp.delete<number>(serverURL + '/categoria/' + id);
  // }

  // empty(): Observable<number> {
  //   return this.oHttp.delete<number>(serverURL + '/categoria/empty');
  // }

//   publicar(id: number): Observable<number> {
//     return this.oHttp.put<number>(serverURL + '/categoria/publicar/' + id, {});
//   }

//   despublicar(id: number): Observable<number> {
//     return this.oHttp.put<number>(serverURL + '/categoria/despublicar/' + id, {});
//   }
}
