import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <header class="header">
        <h1>Gestion des Employés</h1>
        <button class="btn-logout" (click)="logout()">Déconnexion</button>
      </header>

      <div class="actions">
        <button class="btn-primary" (click)="openModal()">
          <span class="icon">+</span> Ajouter un employé
        </button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Salaire</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let employee of employees">
              <td>{{ employee.id }}</td>
              <td>{{ employee.firstName }}</td>
              <td>{{ employee.lastName }}</td>
              <td>{{ employee.email }}</td>
              <td>{{ employee.salary | number:'1.2-2' }} MAD</td>
              <td class="actions-cell">
                <button class="btn-edit" (click)="editEmployee(employee)">Modifier</button>
                <button class="btn-delete" (click)="deleteEmployee(employee.id!)">Supprimer</button>
              </td>
            </tr>
            <tr *ngIf="employees.length === 0">
              <td colspan="6" class="no-data">Aucun employé trouvé</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div class="modal" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Modifier' : 'Ajouter' }} un employé</h2>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>

          <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">Prénom *</label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="form-control"
                  [class.error]="employeeForm.get('firstName')?.invalid && employeeForm.get('firstName')?.touched">
                <div class="error-message" *ngIf="employeeForm.get('firstName')?.invalid && employeeForm.get('firstName')?.touched">
                  Le prénom est requis
                </div>
              </div>

              <div class="form-group">
                <label for="lastName">Nom *</label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="form-control"
                  [class.error]="employeeForm.get('lastName')?.invalid && employeeForm.get('lastName')?.touched">
                <div class="error-message" *ngIf="employeeForm.get('lastName')?.invalid && employeeForm.get('lastName')?.touched">
                  Le nom est requis
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-control"
                [class.error]="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched">
              <div class="error-message" *ngIf="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched">
                Email invalide
              </div>
            </div>

            <div class="form-group">
              <label for="salary">Salaire *</label>
              <input
                id="salary"
                type="number"
                formControlName="salary"
                class="form-control"
                [class.error]="employeeForm.get('salary')?.invalid && employeeForm.get('salary')?.touched">
              <div class="error-message" *ngIf="employeeForm.get('salary')?.invalid && employeeForm.get('salary')?.touched">
                Le salaire doit être positif
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn-primary" [disabled]="employeeForm.invalid">
                {{ isEditMode ? 'Modifier' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      color: #333;
      font-size: 2rem;
    }

    .btn-logout {
      padding: 0.5rem 1rem;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-logout:hover {
      background: #c0392b;
    }

    .actions {
      margin-bottom: 1.5rem;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .icon {
      font-size: 1.25rem;
    }

    .table-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    th, td {
      padding: 1rem;
      text-align: left;
    }

    tbody tr {
      border-bottom: 1px solid #e1e1e1;
    }

    tbody tr:hover {
      background: #f8f9fa;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }

    .btn-edit, .btn-delete {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-edit {
      background: #3498db;
      color: white;
    }

    .btn-edit:hover {
      background: #2980b9;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
    }

    .btn-delete:hover {
      background: #c0392b;
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 2rem;
    }

    /* Modal */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #999;
    }

    .close-btn:hover {
      color: #333;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e1e1e1;
      border-radius: 5px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: #95a5a6;
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  employees: Employee[] = [];
  showModal = false;
  isEditMode = false;
  currentEmployeeId?: number;
  employeeForm: FormGroup;

  constructor() {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      salary: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés', error);
      }
    });
  }

  openModal(): void {
    this.isEditMode = false;
    this.employeeForm.reset();
    this.showModal = true;
  }

  editEmployee(employee: Employee): void {
    this.isEditMode = true;
    this.currentEmployeeId = employee.id;
    this.employeeForm.patchValue(employee);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.employeeForm.reset();
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const employee: Employee = this.employeeForm.value;

      if (this.isEditMode && this.currentEmployeeId) {
        this.employeeService.update(this.currentEmployeeId, employee).subscribe({
          next: () => {
            this.loadEmployees();
            this.closeModal();
          },
          error: (error) => {
            console.error('Erreur lors de la modification', error);
          }
        });
      } else {
        this.employeeService.create(employee).subscribe({
          next: () => {
            this.loadEmployees();
            this.closeModal();
          },
          error: (error) => {
            console.error('Erreur lors de la création', error);
          }
        });
      }
    }
  }

  deleteEmployee(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.employeeService.delete(id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
