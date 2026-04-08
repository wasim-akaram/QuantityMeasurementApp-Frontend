import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuantityDTO {
  value: number;
  unit: string;
  measurementType: string;
}

export interface CompareRequest {
  q1: QuantityDTO;
  q2: QuantityDTO;
}

export interface ConvertRequest {
  quantity: QuantityDTO;
  targetUnit: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuantityService {
  private readonly apiUrl = '/api/v1/quantities';

  constructor(private http: HttpClient) {}

  compare(q1: QuantityDTO, q2: QuantityDTO): Observable<boolean> {
    const request: CompareRequest = { q1, q2 };
    return this.http.post<boolean>(`${this.apiUrl}/compare`, request);
  }

  convert(quantity: QuantityDTO, targetUnit: string): Observable<QuantityDTO> {
    const request: ConvertRequest = { quantity, targetUnit };
    return this.http.post<QuantityDTO>(`${this.apiUrl}/convert`, request);
  }

  add(q1: QuantityDTO, q2: QuantityDTO): Observable<QuantityDTO> {
    const request: CompareRequest = { q1, q2 };
    return this.http.post<QuantityDTO>(`${this.apiUrl}/add`, request);
  }

  subtract(q1: QuantityDTO, q2: QuantityDTO): Observable<QuantityDTO> {
    const request: CompareRequest = { q1, q2 };
    return this.http.post<QuantityDTO>(`${this.apiUrl}/subtract`, request);
  }

  divide(q1: QuantityDTO, q2: QuantityDTO): Observable<number> {
    const request: CompareRequest = { q1, q2 };
    return this.http.post<number>(`${this.apiUrl}/divide`, request);
  }

  multiply(q1: QuantityDTO, q2: QuantityDTO): Observable<number> {
    const request: CompareRequest = { q1, q2 };
    return this.http.post<number>(`${this.apiUrl}/multiply`, request);
  }
}