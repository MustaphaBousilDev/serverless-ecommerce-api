export interface AddressProps {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export class Address {
  private readonly props: AddressProps;

  constructor(props: AddressProps) {
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.street || this.props.street.trim() === '') {
      throw new Error('Street is required');
    }
    if (!this.props.city || this.props.city.trim() === '') {
      throw new Error('City is required');
    }
    if (!this.props.country || this.props.country.trim() === '') {
      throw new Error('Country is required');
    }
    if (!this.props.zipCode || this.props.zipCode.trim() === '') {
      throw new Error('Zip code is required');
    }
  }

  get street(): string {
    return this.props.street;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }

  get country(): string {
    return this.props.country;
  }

  get zipCode(): string {
    return this.props.zipCode;
  }

  toObject(): any {
    return {
      street: this.props.street,
      city: this.props.city,
      state: this.props.state,
      country: this.props.country,
      zipCode: this.props.zipCode,
    };
  }

  static fromObject(data: any): Address {
    return new Address({
      street: data.street,
      city: data.city,
      state: data.state,
      country: data.country,
      zipCode: data.zipCode,
    });
  }

  toString(): string {
    return `${this.props.street}, ${this.props.city}, ${this.props.state} ${this.props.zipCode}, ${this.props.country}`;
  }
}