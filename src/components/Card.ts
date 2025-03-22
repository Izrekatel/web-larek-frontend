import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { CDN_URL } from '../utils/constants';
import { IProduct } from '../types';

interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

export class Card extends Component<IProduct> {
  protected _title: HTMLElement;
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement;

  private readonly categoryModifiers: { [key: string]: string } = {
    'софт-скил': 'soft',
    'хард-скил': 'hard',
    'другое': 'other',
    'дополнительное': 'additional',
    'кнопка': 'button',
  };

  constructor(
    protected blockName: string,
    container: HTMLElement,
    actions?: ICardActions
  ) {
    super(container);

    this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
    this._image = ensureElement<HTMLImageElement>(
      `.${blockName}__image`,
      container
    );
    this._button = container.querySelector(`.${blockName}__button`);
    this._category = container.querySelector(`.${blockName}__category`);
    this._price = container.querySelector(`.${blockName}__price`);

    if (actions?.onClick) {
      if (this._button) {
        this._button.addEventListener('click', actions.onClick);
      } else {
        container.addEventListener('click', actions.onClick);
      }
    }
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }
  get id(): string {
    return this.container.dataset.id || '';
  }

  set title(value: string) {
    this.setText(this._title, value);
  }
  get title(): string {
    return this._title.textContent || '';
  }

  set image(value: string) {
    this.setImage(this._image, CDN_URL + value);
  }

  set inBasket(value: boolean) {
    this.setDisabled(this._button, value);
  }

  set price(value: number | null) {
    this.setText(this._price, value
      ? value.toString() + ' синапсов' : 'Бесценно')
    this.setDisabled(this._button, !value);
  }

  set category(value: string) {
    this.setText(this._category, value);
    Object.values(this.categoryModifiers).forEach(modifier => {
      this._category.classList.remove(`${this.blockName}__category_${modifier}`);
    });
    const modifier = this.categoryModifiers[value];
    if (modifier) {
      this._category.classList.add(`${this.blockName}__category_${modifier}`);
    } else {
      this._category.classList.add(`${this.blockName}__category_other`);
    }
  }
}

export class CatalogItem extends Card {
  constructor(container: HTMLElement, actions?: ICardActions) {
    super('card', container, actions);
  }
}

export class CatalogItemPreview extends Card {
  protected _description: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super('card', container, actions);

    this._description = container.querySelector(`.${this.blockName}__text`);
  }

  set description(value: string) {
    this.setText( this._description, value);
  }
}
