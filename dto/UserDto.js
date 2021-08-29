class UserDto {
    constructor(email, name, isAdmin, password, date) {
        this.email = email;
        this.name = name;
        this.isAdmin = isAdmin;
        this.password = password;
        this.date = date;
    }
}

module.exports = UserDto;