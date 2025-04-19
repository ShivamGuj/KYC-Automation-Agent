// Define KYC checklist items
export interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: 'pending' | 'complete';
  value?: string;
  sourceDocument?: string;
  sourcePage?: number;
  sourceCoordinates?: { x: number; y: number; width: number; height: number };
}

// Initial checklist template
export const kycChecklistTemplate: ChecklistItem[] = [
  {
    id: 'full_name',
    name: 'Full Name',
    description: 'Customer\'s full legal name',
    required: true,
    status: 'pending'
  },
  {
    id: 'dob',
    name: 'Date of Birth',
    description: 'Customer\'s date of birth',
    required: true,
    status: 'pending'
  },
  {
    id: 'address',
    name: 'Residential Address',
    description: 'Customer\'s current residential address',
    required: true,
    status: 'pending'
  },
  {
    id: 'id_number',
    name: 'ID Number',
    description: 'Government-issued identification number',
    required: true,
    status: 'pending'
  },
  {
    id: 'nationality',
    name: 'Nationality',
    description: 'Customer\'s nationality',
    required: true,
    status: 'pending'
  },
  {
    id: 'phone',
    name: 'Phone Number',
    description: 'Customer\'s contact phone number',
    required: true,
    status: 'pending'
  },
  {
    id: 'email',
    name: 'Email Address',
    description: 'Customer\'s email address',
    required: true,
    status: 'pending'
  },
  {
    id: 'occupation',
    name: 'Occupation',
    description: 'Customer\'s current occupation',
    required: false,
    status: 'pending'
  },
  {
    id: 'company_name',
    name: 'Company Name',
    description: 'Name of the company (for business KYC)',
    required: false,
    status: 'pending'
  },
  {
    id: 'registration_number',
    name: 'Company Registration Number',
    description: 'Official company registration number',
    required: false,
    status: 'pending'
  },
  {
    id: 'directors',
    name: 'Company Directors',
    description: 'List of company directors',
    required: false,
    status: 'pending'
  },
  {
    id: 'shareholders',
    name: 'Company Shareholders',
    description: 'List of company shareholders',
    required: false,
    status: 'pending'
  }
];

// Checklist service
class ChecklistService {
  private checklist: ChecklistItem[];

  constructor() {
    // Initialize with a deep copy of the template
    this.checklist = JSON.parse(JSON.stringify(kycChecklistTemplate));
  }

  // Get the current checklist
  getChecklist(): ChecklistItem[] {
    return this.checklist;
  }

  // Update the checklist with new items
  updateChecklist(newChecklist: ChecklistItem[]): void {
    this.checklist = newChecklist;
  }

  // Reset the checklist to the initial state
  resetChecklist(): void {
    this.checklist = JSON.parse(JSON.stringify(kycChecklistTemplate));
  }

  // Get pending items
  getPendingItems(): string[] {
    return this.checklist
      .filter(item => item.status === 'pending' && item.required)
      .map(item => item.name);
  }

  // Update a specific checklist item
  updateChecklistItem(id: string, updates: Partial<ChecklistItem>): void {
    const itemIndex = this.checklist.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      this.checklist[itemIndex] = { ...this.checklist[itemIndex], ...updates };
    }
  }
}

export default ChecklistService;
