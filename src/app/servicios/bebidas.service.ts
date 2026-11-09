import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BebidasService {

  private api = 'https://www.thecocktaildb.com/api/json/v1/1/';

  private tipoActual = 'Todas';

  constructor(private http: HttpClient) {}

  obtenerBebidas(): Observable<any[]> {
    return this.buscarTipo(this.tipoActual);
  }

  buscarNombre(nombre: string): Observable<any[]> {

    if (!nombre.trim()) {
      return this.obtenerBebidas();
    }

    return this.http.get<any>(
      this.api + 'search.php?s=' + encodeURIComponent(nombre)
    ).pipe(
      switchMap(data =>
        this.obtenerDetalles(data.drinks || [])
      )
    );
  }

  buscarIngrediente(ingrediente: string): Observable<any[]> {

    if (!ingrediente.trim()) {
      return this.obtenerBebidas();
    }

    return this.http.get<any>(
      this.api + 'filter.php?i=' + encodeURIComponent(ingrediente)
    ).pipe(
      switchMap(data =>
        this.obtenerDetalles(data.drinks || [])
      )
    );
  }

  buscarCategoria(categoria: string): Observable<any[]> {

    if (!categoria || categoria === 'Todas') {
      return this.obtenerBebidas();
    }

    return this.http.get<any>(
      this.api + 'filter.php?c=' + encodeURIComponent(categoria)
    ).pipe(
      switchMap(data =>
        this.obtenerDetalles(data.drinks || [])
      )
    );
  }

  buscarTipo(tipo: string): Observable<any[]> {

    this.tipoActual = tipo;

    let url = '';

    if (tipo === 'Todas') {
      url = this.api + 'filter.php?a=Alcoholic';
    } else if (tipo === 'Alcoholic') {
      url = this.api + 'filter.php?a=Alcoholic';
    } else {
      url = this.api + 'filter.php?a=Non_Alcoholic';
    }

    return this.http.get<any>(url).pipe(
      switchMap(data =>
        this.obtenerDetalles(data.drinks || [], tipo)
      )
    );
  }

  private generarPrecio(): number {

    const minimo = 15000;
    const maximo = 30000;

    return Math.floor(
      Math.random() * ((maximo - minimo) / 1000 + 1)
    ) * 1000 + minimo;
  }

  private obtenerDetalles(
    bebidas: any[],
    tipo: string = this.tipoActual
  ): Observable<any[]> {

    const resultados = bebidas.slice(0, 12);

    if (!resultados.length) {
      return of([]);
    }

    const peticiones = resultados.map(bebida =>
      this.http.get<any>(
        this.api + 'lookup.php?i=' + bebida.idDrink
      )
    );

    return forkJoin(peticiones).pipe(
      map(respuestas =>
        respuestas
          .map(respuesta => respuesta.drinks?.[0])
          .filter((bebida: any) => {

            if (!bebida) {
              return false;
            }

            if (tipo === 'Alcoholic') {
              return bebida.strAlcoholic === 'Alcoholic';
            }

            if (tipo === 'Non_Alcoholic') {
              return bebida.strAlcoholic === 'Non alcoholic';
            }

            return true;
          })
          .map((bebida: any) => ({
            ...bebida,
            precio: this.generarPrecio(),
            ingredientes: this.obtenerIngredientes(bebida)
          }))
      )
    );
  }

  private obtenerIngredientes(bebida: any): string[] {

    const ingredientes: string[] = [];

    for (let i = 1; i <= 15; i++) {

      const ingrediente = bebida['strIngredient' + i];

      if (ingrediente && ingrediente.trim()) {
        ingredientes.push(ingrediente.trim());
      }

    }

    return ingredientes;
  }

}