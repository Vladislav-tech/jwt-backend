class UserDto {
  email: string;
  id: string;
  isActivated: boolean;
  favorites: string[];
  name: string;

  constructor(model: any) {
    this.email = model.email;
    this.id = model._id;
    this.isActivated = model.isActivated;
    this.favorites = model.favorites || [];
    this.name = model.name;
  }
}

export default UserDto;