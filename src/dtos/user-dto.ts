class UserDto {
  email: string;
  id: string;
  isActivated: boolean;
  favorites: string[];
  name: string;
  registrationDate: string;
  lastSignInDate: string;

  constructor(model: any) {
    this.email = model.email;
    this.id = model._id;
    this.isActivated = model.isActivated;
    this.favorites = model.favorites || [];
    this.name = model.name;
    this.registrationDate = model.registrationDate;
    this.lastSignInDate = model.lastSignInDate;
  }
}

export default UserDto;