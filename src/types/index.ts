export type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};

export interface IProduct {
	id: string;
	description: string;
	image: string;
    title: string;
    category: string;
    price: number | null;
	inBasket: boolean;
}

export interface IPaymentData {
	payment: string;
	address: string;
}

export interface IContacts {
	email: string;
	phone: string;
}

export interface IPaymentInformation extends IPaymentData, IContacts {}

export type FormErrors = Partial<Record<keyof IPaymentInformation, string>>;

export interface IOrder extends IPaymentInformation {
	total: number;
	items: string[];
}

export interface IOrderResult {
	id: string;
    total: number;
}

export interface IProductAPI {
	getProducts: () => Promise<IProduct[]>;
	orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

export interface IAppState {
	products?: IProduct[];
	contacts: IPaymentInformation;
	validationError: FormErrors;

	loadProducts(products: IProduct[]): void;
	fillContacts(contacts: Partial<IPaymentInformation>): void;
	getOrderData(): IOrder;
	getProductsInBasket(): IProduct[];
	getBasketTotal(): number;
	clearBasket(): void;
	validateContacts(): void;
  }
