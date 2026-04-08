import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuantityService, QuantityDTO } from './quantity.service';
import { Observable } from 'rxjs';

type UnitType = 'length' | 'weight' | 'temperature' | 'volume';

const UNITS: Record<UnitType, string[]> = {
  length: ['Kilometer', 'Meter', 'Centimeter', 'Millimeter', 'Mile', 'Foot', 'Inch', 'Yard'],
  weight: ['Kilogram', 'Gram', 'Milligram', 'Pound', 'Ounce', 'Ton'],
  temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
  volume: ['Liter', 'Milliliter', 'Cubic Meter', 'Gallon', 'Fluid Ounce', 'Cup']
};

const TO_SI: Record<Exclude<UnitType, 'temperature'>, Record<string, number>> = {
  length: { Kilometer: 1000, Meter: 1, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.344, Foot: 0.3048, Inch: 0.0254, Yard: 0.9144 },
  weight: { Kilogram: 1, Gram: 0.001, Milligram: 1e-6, Pound: 0.453592, Ounce: 0.0283495, Ton: 1000 },
  volume: { Liter: 1, Milliliter: 0.001, 'Cubic Meter': 1000, Gallon: 3.78541, 'Fluid Ounce': 0.0295735, Cup: 0.236588 }
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentType: UnitType = 'length';
  currentAction: 'comparison' | 'conversion' | 'arithmetic' = 'comparison';
  currentOp: '+' | '-' | '*' | '/' = '+';
  units = UNITS;

  get currentUnits(): string[] {
    return this.units[this.currentType];
  }

  val1 = 1;
  val2 = 1000;
  unit1 = 'Kilometer';
  unit2 = 'Meter';

  resultHtml = '';
  hasResult = false;
  welcomeText = '';

  constructor(private router: Router, private quantityService: QuantityService) { }

  private getMeasurementType(): string {
    return this.currentType.toUpperCase();
  }

  private createQuantityDTO(value: number, unit: string): QuantityDTO {
    return {
      value,
      unit,
      measurementType: this.getMeasurementType()
    };
  }

  ngOnInit() {
    if (typeof window === 'undefined') {
      return;
    }

    const session = JSON.parse(window.localStorage.getItem('qm_session') || 'null');
    if (!session) {
      this.router.navigate(['/']);
      return;
    }

    this.welcomeText = session.name;
    this.setType('length');
  }

  setType(type: UnitType) {
    this.currentType = type;
    this.unit1 = UNITS[type][0];
    this.unit2 = (type === 'length' ? 'Meter' : type === 'weight' ? 'Gram' : type === 'volume' ? 'Milliliter' : 'Fahrenheit');
    this.val1 = 1;
    this.val2 = type === 'temperature' ? 32 : 1000;
    this.hideResult();
  }

  setAction(action: 'comparison' | 'conversion' | 'arithmetic') {
    this.currentAction = action;
    this.hideResult();
  }

  setOp(op: '+' | '-' | '*' | '/') {
    this.currentOp = op;
  }

  toggleExtraInput() {
    return this.currentAction !== 'conversion';
  }

  convertToSI(val: number, unit: string) {
    if (this.currentType === 'temperature') return val;
    return val * TO_SI[this.currentType as Exclude<UnitType, 'temperature'>][unit];
  }

  convertFromSI(si: number, unit: string) {
    if (this.currentType === 'temperature') return si;
    return si / TO_SI[this.currentType as Exclude<UnitType, 'temperature'>][unit];
  }

  convertTemperature(value: number, from: string, to: string) {
    let c;
    if (from === 'Celsius') c = value;
    else if (from === 'Fahrenheit') c = (value - 32) * 5 / 9;
    else c = value - 273.15;

    if (to === 'Celsius') return c;
    if (to === 'Fahrenheit') return c * 9 / 5 + 32;
    return c + 273.15;
  }

  doOp(a: number, b: number) {
    if (this.currentOp === '+') return a + b;
    if (this.currentOp === '-') return a - b;
    if (this.currentOp === '*') return a * b;
    if (this.currentOp === '/') {
      if (b === 0) {
        alert('Cannot divide by zero.');
        return null;
      }
      return a / b;
    }
    return null;
  }

  fmt(n: number) {
    if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4);
    return parseFloat(n.toFixed(6)).toString();
  }

  hideResult() {
    this.hasResult = false;
  }

  calculate() {
    if (isNaN(this.val1)) { alert('Please enter a valid number in the FROM field.'); return; }

    if (this.currentAction === 'conversion') {
      if (this.currentType === 'temperature') {
        // Handle temperature conversion locally
        const output = this.convertTemperature(this.val1, this.unit1, this.unit2);
        const html = `<div class="subtext">Conversion Result</div><div class="result-value">${this.fmt(this.val1)} ${this.unit1} = <strong>${this.fmt(output)} ${this.unit2}</strong></div>`;
        this.resultHtml = html;
        this.hasResult = true;
      } else {
        const quantity = this.createQuantityDTO(this.val1, this.unit1);
        this.quantityService.convert(quantity, this.unit2).subscribe({
          next: (result) => {
            const html = `<div class="subtext">Conversion Result</div><div class="result-value">${this.fmt(this.val1)} ${this.unit1} = <strong>${this.fmt(result.value)} ${result.unit}</strong></div>`;
            this.resultHtml = html;
            this.hasResult = true;
          },
          error: (error) => {
            alert('Conversion failed: ' + error.message);
          }
        });
      }
    } else if (this.currentAction === 'comparison') {
      if (isNaN(this.val2)) { alert('Please enter a value in the TO field.'); return; }
      const siA = this.currentType === 'temperature' ? this.convertTemperature(this.val1, this.unit1, 'Celsius') : this.convertToSI(this.val1, this.unit1);
      const siB = this.currentType === 'temperature' ? this.convertTemperature(this.val2, this.unit2, 'Celsius') : this.convertToSI(this.val2, this.unit2);
      const sym = siA > siB ? '>' : siA < siB ? '<' : '=';
      const color = siA > siB ? '#f72585' : siA < siB ? '#4361ee' : '#2ecc71';
      const html = `<div class="subtext">Comparison Result</div><div class="result-value" style="color:${color};">${this.fmt(this.val1)} ${this.unit1} <span class="sym">${sym}</span> ${this.fmt(this.val2)} ${this.unit2}</div>`;
      this.resultHtml = html;
      this.hasResult = true;
    } else {
      if (isNaN(this.val2)) { alert('Please enter a value in the Value 2 field.'); return; }
      if (this.currentType === 'temperature') {
        alert('Arithmetic operations are not supported for temperature.');
        return;
      }
      const q1 = this.createQuantityDTO(this.val1, this.unit1);
      const q2 = this.createQuantityDTO(this.val2, this.unit2);
      let serviceCall: Observable<QuantityDTO | number>;
      if (this.currentOp === '+') {
        serviceCall = this.quantityService.add(q1, q2);
      } else if (this.currentOp === '-') {
        serviceCall = this.quantityService.subtract(q1, q2);
      } else if (this.currentOp === '*') {
        serviceCall = this.quantityService.multiply(q1, q2);
      } else if (this.currentOp === '/') {
        serviceCall = this.quantityService.divide(q1, q2);
      } else {
        return;
      }
      serviceCall.subscribe({
        next: (result) => {
          let displayResult: string;
          let unit: string = '';
          if (typeof result === 'number') {
            displayResult = this.fmt(result);
          } else {
            displayResult = this.fmt(result.value);
            unit = ' ' + result.unit;
          }
          const opSym = { '+': '+', '-': '−', '*': '×', '/': '÷' }[this.currentOp];
          const html = `<div class="subtext">Arithmetic Result</div><div class="result-value">${this.fmt(this.val1)} ${this.unit1} ${opSym} ${this.fmt(this.val2)} ${this.unit2} = <strong>${displayResult}${unit}</strong></div>`;
          this.resultHtml = html;
          this.hasResult = true;
        },
        error: (error) => {
          alert('Arithmetic operation failed: ' + error.message);
        }
      });
    }
  }

  logout() {
    localStorage.removeItem('qm_session');
    this.router.navigate(['/']);
  }
}
