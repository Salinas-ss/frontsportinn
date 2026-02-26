import { Component, OnInit, Input, Output, EventEmitter, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CategoriaService } from '../../../service/categoria';
import { TemporadaService } from '../../../service/temporada';
import { ICategoria } from '../../../model/categoria';
import { ITemporada } from '../../../model/temporada';
import { TemporadaPlistAdminUnrouted } from '../../temporada/plist-admin-unrouted/temporada-plist-admin-unrouted';
import { IPago } from '../../../model/pago';
import { PagoService } from '../../../service/pago';
import { CuotaService } from '../../../service/cuota';
import { JugadorService } from '../../../service/jugador-service';
import { ICuota } from '../../../model/cuota';
import { IJugador } from '../../../model/jugador';
import { CuotaPlistAdminUnrouted } from '../../cuota/plist-admin-unrouted/cuota-plist-admin-unrouted';
import { JugadorPlistAdminUnrouted } from '../../jugador/plist-admin-unrouted/jugador-plist-admin-unrouted';

@Component({
  selector: 'app-pago-form-unrouted',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pago-form.html',
  styleUrls: ['./pago-form.css']
})
export class PagoFormAdminUnrouted implements OnInit {
  @Input() pago: IPago | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() formSuccess = new EventEmitter<void>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private oPagoService = inject(PagoService);
  private oCuotaService = inject(CuotaService);
  private oJugadorService = inject(JugadorService);
  private dialog = inject(MatDialog);

  pagoForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  submitting = signal(false);
  cuotas = signal<ICuota[]>([]);
  selectedCuota = signal<ICuota | null>(null);
  jugadores = signal<IJugador[]>([]);
  selectedJugador = signal<IJugador | null>(null);

  constructor() {
    effect(() => {
      const p = this.pago;
      if (p && this.pagoForm) {
        this.loadPagoData(p);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCuotas();
    this.loadJugadores();
    if (this.pago) {
      this.loadPagoData(this.pago);
    }
  }

  private initForm(): void {
    this.pagoForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      abonado: [false],
      fecha: ['', [Validators.required]],
      id_cuota: [null, Validators.required],
      id_jugador: [null, Validators.required]
    });
  }

  private loadPagoData(pago: IPago): void {
    this.pagoForm.patchValue({
      id: pago.id,
      abonado: pago.abonado,
      fecha: pago.fecha,
      id_cuota: pago.cuota?.id,
      id_jugador: pago.jugador?.id
    });
    if (pago.cuota) {
      this.syncCuota(pago.cuota.id);
    }
    if (pago.jugador) {
      this.syncJugador(pago.jugador.id);
    }
  }

  private syncCuota(id: number | null): void {
    if (!id) {
      this.selectedCuota.set(null);
      return;
    }
    this.oCuotaService.get(id).subscribe({
      next: (cuota) => {
        this.selectedCuota.set(cuota);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al sincronizar cuota:', err);
        this.snackBar.open('Error al cargar la cuota seleccionada', 'Cerrar', { duration: 3000 });
        this.selectedCuota.set(null);
      }
    });
  }

  openCuotaFinderModal(): void {
    const dialogRef = this.dialog.open(CuotaPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'cuota-dialog',
      data: { title: 'Elige una cuota', message: 'Selecciona la cuota para el pago' }
    });

    dialogRef.afterClosed().subscribe((cuota: ICuota | null) => {
      if (cuota) {
        this.pagoForm.patchValue({ id_cuota: cuota.id });
        this.syncCuota(cuota.id);
        this.snackBar.open(`Cuota seleccionada: ${cuota.descripcion}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  private loadCuotas(): void {
    this.oCuotaService.getPage(0, 1000, 'descripcion', 'asc', '', 0).subscribe({
      next: (page) => this.cuotas.set(page.content),
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.snackBar.open('Error cargando cuotas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private syncJugador(id: number | null): void {
    if (!id) {
      this.selectedJugador.set(null);
      return;
    }
    this.oJugadorService.getById(id).subscribe({
      next: (jugador) => {
        this.selectedJugador.set(jugador);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al sincronizar jugador:', err);
        this.snackBar.open('Error al cargar el jugador seleccionado', 'Cerrar', { duration: 3000 });
        this.selectedJugador.set(null);
      }
    });
  }

  openJugadorFinderModal(): void {
    const dialogRef = this.dialog.open(JugadorPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'jugador-dialog',
      data: { title: 'Elige un jugador', message: 'Selecciona el jugador para el pago' }
    });

    dialogRef.afterClosed().subscribe((jugador: IJugador | null) => {
      if (jugador) {
        this.pagoForm.patchValue({ id_jugador: jugador.id });
        this.syncJugador(jugador.id);
        this.snackBar.open(`Jugador seleccionado: ${jugador.usuario?.nombre} ${jugador.usuario?.apellido1}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  private loadJugadores(): void {
    this.oJugadorService.getPage(0, 1000, , 'asc', '', 0).subscribe({
      next: (page) => this.jugadores.set(page.content),
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.snackBar.open('Error cargando jugadores', 'Cerrar', { duration: 3000 });
      }
    });
  }

  get abonado() { return this.pagoForm.get('abonado'); }
  get fecha() { return this.pagoForm.get('fecha'); }
  get id_cuota() { return this.pagoForm.get('id_cuota'); }
  get id_jugador() { return this.pagoForm.get('id_jugador'); }

  onSubmit(): void {
    if (this.pagoForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', { duration: 4000 });
      return;
    }

    this.submitting.set(true);

    const pagoData: any = {
      abonado: this.pagoForm.value.abonado,
      fecha: this.pagoForm.value.fecha,
      cuota: { id: this.pagoForm.value.id_cuota },
      jugador: { id: this.pagoForm.value.id_jugador },

      
    };

    if (this.mode === 'edit' && this.pago?.id) {
      pagoData.id = this.pago.id;
      this.oPagoService.update(pagoData).subscribe({
        next: () => { this.snackBar.open('Pago actualizado exitosamente', 'Cerrar', { duration: 4000 }); this.submitting.set(false); this.formSuccess.emit(); },
        error: (err: HttpErrorResponse) => { this.error.set('Error actualizando el pago'); this.snackBar.open('Error actualizando el pago', 'Cerrar', { duration: 4000 }); console.error(err); this.submitting.set(false); }
      });
    } else {
      this.oPagoService.create(pagoData).subscribe({
        next: () => { this.snackBar.open('Pago creado exitosamente', 'Cerrar', { duration: 4000 }); this.submitting.set(false); this.formSuccess.emit(); },
        error: (err: HttpErrorResponse) => { this.error.set('Error creando el pago'); this.snackBar.open('Error creando el pago', 'Cerrar', { duration: 4000 }); console.error(err); this.submitting.set(false); }
      });
    }
  }

  onCancel(): void { this.formCancel.emit(); }
}