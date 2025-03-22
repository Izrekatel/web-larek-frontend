import './scss/styles.scss';
import { Api, ApiListResponse } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { AppState, Product, PaymentInformation } from './components/AppData';
import { API_URL } from './utils/constants';
import { ensureElement, cloneTemplate } from './utils/utils';
import {Page} from "./components/Page";
import { Modal } from './components/common/Modal';
import { CatalogItem, CatalogItemPreview } from './components/Card';
import { Basket, ItemBasket } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';


const api = new Api(API_URL);
const events = new EventEmitter();
const appData = new AppState({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const ProductTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success')

const basket = new Basket('basket', cloneTemplate(basketTemplate), events);
const order = new Order('order', cloneTemplate(orderTemplate), events)
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success('order-success', cloneTemplate(successTemplate), {
  onClick: () => {
    events.emit('modal:close')
    modal.close()
  }
})


api.get('/product')
  .then((res: ApiListResponse<Product>) => {
    appData.loadProducts(res.items as Product[]);
  })
  .catch((err) => {
    console.error(err);
  });

events.on('items:changed', () => {
    page.catalog = appData.products.map((item) => {
      const product = new CatalogItem(cloneTemplate(ProductTemplate), {
        onClick: () => events.emit('card:select', item),
      });
      return product.render(item);
    });
  });

events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    page.locked = false;
});

events.on('card:select', (item: Product) => {
    const product = new CatalogItemPreview(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
           events.emit('card:toBasket', item)
        },
    });
    modal.render({content: product.render(item)});
});

events.on('card:toBasket', (item: Product) => {
    item.inBasket = true;
    events.emit('basket:change');
    modal.close();
})

events.on('basket:open', () => {
  page.locked = true
  const basketItems = appData.getProductsInBasket().map((item, index) => {
    const storeItem = new ItemBasket(
      'card',
      cloneTemplate(cardBasketTemplate),
      {
        onClick: () => events.emit('basket:delete', item)
      }
    );
    return storeItem.render({
      title: item.title,
      price: item.price,
      index: index + 1,
    });
  });
  modal.render({
    content: basket.render({
      list: basketItems,
      price: appData.getBasketTotal(),
    }),
  });
});

events.on('basket:change', () => {
  page.counter = appData.getProductsInBasket().length;
  events.emit('basket:open');
})

events.on('basket:delete', (item: Product) => {
    item.inBasket = false;
    events.emit('basket:change');
})

events.on('basket:order', () => {
    modal.render({
        content: order.render(
            {
                address: '',
                valid: false,
                errors: []
            }
        ),
    });
});

events.on('orderFormErrors:change', () => {
    const { payment, address } = appData.validationErrors;
    order.valid = !payment && !address;
    order.errors = Object.values({ payment, address }).filter(i => !!i).join('; ');
});

events.on('contactsFormErrors:change', () => {
    const { email, phone } = appData.validationErrors;
    contacts.valid = !email && !phone;
    contacts.errors = Object.values({ phone, email }).filter(i => !!i).join('; ');
});

events.on(/^(order|contacts)\.(.+):change$/, (data: { field: keyof PaymentInformation, value: string }) => {
  appData.fillContacts({ [data.field]: data.value });
});

events.on('order:submit', () => {
    modal.render({
        content: contacts.render(
            {
              valid: false,
              errors: []
            }
        ),
    });
})

events.on('contacts:submit', () => {
  api.post('/order', appData.getOrderData())
    .then((res) => {
      events.emit('order:success', res);
      appData.clearBasket();
      order.disableButtons();
      page.counter = 0;
    })
    .catch((err) => {
      console.log(err)
    })
})

events.on('order:success', (res: ApiListResponse<string>) => {
  modal.render({
    content: success.render({
      description: res.total
    })
  })
})