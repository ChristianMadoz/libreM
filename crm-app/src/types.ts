export interface Company {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    created_at: string;
}

export interface Contact {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company_id?: string;
    tags?: string[];
    created_at: string;
    companies?: { name: string };
}

export interface Deal {
    id: string;
    title: string;
    value: number;
    stage: string;
    company_id?: string;
    contact_id?: string;
    expected_close_date?: string;
    created_at: string;
    companies?: { name: string };
    contacts?: { first_name: string; last_name: string; email: string };
}

export interface Note {
    id: string;
    deal_id: string;
    content: string;
    created_at: string;
}

export interface Task {
    id: string;
    deal_id: string;
    title: string;
    is_completed: boolean;
    created_at: string;
}

export interface Attachment {
    id: string;
    deal_id: string;
    file_name: string;
    file_key: string;
    file_url: string;
    created_at: string;
}
