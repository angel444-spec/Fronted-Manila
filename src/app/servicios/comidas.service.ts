
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ComidasService {

  private api = 'https://www.themealdb.com/api/json/v1/1/';

  private categorias = [
    'Beef',
    'Chicken',
    'Dessert',
    'Lamb',
    'Miscellaneous',
    'Pasta',
    'Pork',
    'Seafood',
    'Side',
    'Starter',
    'Vegan',
    'Vegetarian'
  ];

  constructor(private http: HttpClient) {}

  obtenerComidas(): Observable<any[]> {

    const peticiones = this.categorias.map(categoria =>
      this.http.get<any>(
        this.api + 'filter.php?c=' + categoria
      )
    );

    return forkJoin(peticiones).pipe(
      map(respuestas => {

        const comidas = respuestas.flatMap(
          data => data.meals || []
        );

        const unicas = Array.from(
          new Map(
            comidas.map(comida => [
              comida.idMeal,
              comida
            ])
          ).values()
        );

        return unicas;

      }),

      switchMap(comidas => this.obtenerDetalles(comidas))
    );

  }

  buscarNombre(nombre: string): Observable<any[]> {

    if (!nombre.trim()) {
      return this.obtenerComidas();
    }

    return this.http.get<any>(
      this.api + 'search.php?s=' + encodeURIComponent(nombre)
    ).pipe(
      switchMap(data =>
        this.obtenerDetalles(data.meals || [])
      )
    );

  }

  buscarIngrediente(ingrediente: string): Observable<any[]> {

    if (!ingrediente.trim()) {
      return this.obtenerComidas();
    }

    return this.http.get<any>(
      this.api + 'filter.php?i=' + encodeURIComponent(ingrediente)
    ).pipe(
      switchMap(data =>
        this.obtenerDetalles(data.meals || [])
      )
    );

  }

  buscarCategoria(categoria: string): Observable<any[]> {

    if (!categoria || categoria === 'Todas') {
      return this.obtenerComidas();
    }

    return this.http.get<any>(
      this.api + 'filter.php?c=' + encodeURIComponent(categoria)
    ).pipe(
      switchMap(data =>
        this.obtenerDetalles(data.meals || [])
      )
    );

  }

  private generarPrecio(): number {

    const minimo = 15000;
    const maximo = 45000;

    return Math.floor(
      Math.random() * ((maximo - minimo) / 1000 + 1)
    ) * 1000 + minimo;

  }

  private obtenerDetalles(comidas: any[]): Observable<any[]> {

    if (!comidas || comidas.length === 0) {
      return of([]);
    }

    const peticiones = comidas.slice(0, 30).map(comida =>
      this.http.get<any>(
        this.api + 'lookup.php?i=' + comida.idMeal
      )
    );

    return forkJoin(peticiones).pipe(
      map(respuestas =>
        respuestas
          .map(data => data.meals?.[0])
          .filter(comida => comida)
          .map(comida => ({
            ...comida,
            precio: this.generarPrecio(),
            ingredientes: this.obtenerIngredientes(comida)
          }))
      )
    );

  }

  private obtenerIngredientes(comida: any): string[] {

    const ingredientes: string[] = [];

    for (let i = 1; i <= 20; i++) {

      const ingrediente = comida['strIngredient' + i];

      if (ingrediente && ingrediente.trim()) {
        ingredientes.push(ingrediente.trim());
      }

    }

    return ingredientes;

  }

}
