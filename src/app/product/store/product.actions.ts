import { createAction, props } from '@ngrx/store';
import { RawMaterial, Process } from '../../model/product.model';
import { CustomerDetails} from '../../model/customer-details.model';

// Load
export const loadRawMaterials = createAction('[RawMaterial] Load RawMaterials');
export const loadRawMaterialsSuccess = createAction(
  '[RawMaterial] Load RawMaterials Success',
  props<{ rawMaterials: RawMaterial[] }>()
);

// Add
export const addRawMaterial = createAction(
  '[RawMaterial] Add RawMaterial',
  props<{ rawMaterial: RawMaterial }>()
);

export const addRawMaterialSuccess = createAction(
  '[RawMaterial] Add RawMaterial Success',
  props<{ rawMaterial: RawMaterial }>()
);

// Delete
export const deleteRawMaterial = createAction(
  '[RawMaterial] Delete RawMaterial',
  props<{ id: string }>()
);

export const deleteRawMaterialSuccess = createAction(
  '[RawMaterial] Delete RawMaterial Success',
  props<{ id: string }>()
);

// Update
export const updateRawMaterial = createAction(
  '[RawMaterial] Update RawMaterial',
  props<{ id: string; rawMaterial: RawMaterial }>()
);

export const updateRawMaterialSuccess = createAction(
  '[RawMaterial] Update RawMaterial Success',
  props<{ updatedRawMaterial: RawMaterial }>()
);



export const loadProcess = createAction('[Process] Load Process');
export const loadProcessSuccess = createAction('[Process] Load Process Success', props<{ process: Process[] }>());

// Add
export const addProcess = createAction('[Process] Add Process', props<{ process: Process }>());
export const addProcessSuccess = createAction('[Process] Add Process Success', props<{ process: Process }>());

// Delete
export const deleteProcess = createAction('[Process] Delete Process', props<{ id: string }>());
export const deleteProcessSuccess = createAction('[Process] Delete Process Success', props<{ id: string }>());

// Update
export const updateProcess = createAction('[Process] Update Process', props<{ id: string; process: Process }>());
export const updateProcessSuccess = createAction('[Process] Update Process Success', props<{ updatedProcess: Process }>());




// Load
export const loadCustomers = createAction('[Customer] Load Customers');
export const loadCustomersSuccess = createAction(
  '[Customer] Load Customers Success',
  props<{ customers: CustomerDetails[] }>()
);

// Add
export const AddCustomerDetailsComponent = createAction(
  '[CustomerDetails] Add Customer',
  props<{ customer: FormData }>()
);

export const addCustomerSuccess = createAction(
  '[CustomerDetails] Add Customer Success',
  props<{ customer: CustomerDetails }>()
);

// Update
export const updateCustomer = createAction(
  '[CustomerDeatils] Update Customer',
  props<{ id: string; customer: any }>()
);

export const updateCustomerSuccess = createAction(
  '[CustomerDeaitls] Update Customer Success',
  props<{ updatedCustomer: CustomerDetails }>()
);

// Delete
export const deleteCustomer = createAction(
  '[CustomerDetils] Delete Customer',
  props<{ id: string }>()
);

export const deleteCustomerSuccess = createAction(
  '[Customerdeails] Delete Customer Success',
  props<{ id: string }>()
);

// API Failure
export const apiFailure = createAction(
  '[RawMaterial] API Failure',
  props<{ error: any }>()
);



