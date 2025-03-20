import { IOrder, IProduct, IAppState, IPaymentInformation, IOrderResult, FormErrors } from '../types/index';
import {Model} from "./base/Model";


export class Product implements IProduct {
    constructor(
        public id: string,
        public description: string,
        public image: string,
        public title: string,
        public category: string,
        public price: number | null = null,
        public inBasket: boolean = false
    ) {}
}

export class PaymentInformation implements IPaymentInformation {
    constructor(
        public payment: string = "",
        public address: string = "",
        public email: string = "",
        public phone: string = ""
    ) {}
}


export class Order extends PaymentInformation implements IOrder  {
    constructor(
        paymentInfo: PaymentInformation,
        public total: number,
        public items: string[]
    ) {
    super(paymentInfo.payment, paymentInfo.address, paymentInfo.email, paymentInfo.phone);
    }
}

export class OrderResult implements IOrderResult{
    constructor(
      public id: string,
      public total: number
    ) {}
}


export class AppState extends Model<IAppState> {
    products: Product[] = [];
    contacts: PaymentInformation  = new PaymentInformation();
    validationErrors: FormErrors = {};

    loadProducts(products: IProduct[]): void {
        this.products = products;
        this.emitChanges('items:changed', { store: this.products });
    }

    fillContacts(contacts: Partial<PaymentInformation>) {
        Object.assign(this.contacts, contacts);
        this.validateContacts()
    };
    
    getOrderData(): Order {
        const items = this.getProductsInBasket().map(product => product.id);
        const order = new Order(this.contacts, this.getBasketTotal(), items)     
        return order;
    }
    getProductsInBasket(): Product[] {
        return this.products.filter(product => product.inBasket)
    }

    getBasketTotal(): number {
        return this.getProductsInBasket().reduce((sum, product) => sum + (product.price || 0), 0)
    }

    clearBasket(): void {
        this.products.forEach(item => item.inBasket = false);
    }

    validateContacts(): void {
        this.validationErrors = {};
        if (!this.contacts.address) {
            this.validationErrors.address = 'Необходимо указать адрес';
        }
        if (!this.contacts.payment) {
            this.validationErrors.payment = 'Необходимо указать способ оплаты';
        }
         if (!this.contacts.email) {
            this.validationErrors.email = 'Необходимо указать email';
        }
        if (!this.contacts.phone) {
            this.validationErrors.phone = 'Необходимо указать телефон';
        }
        this.events.emit('orderFormErrors:change');
        this.events.emit('contactsFormErrors:change');
      }
}