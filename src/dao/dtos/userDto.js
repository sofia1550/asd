function userDto(user) {
    const { _id, email, first_name, last_name, role } = user;
    return { _id, email, first_name, last_name, role };
}

module.exports = { userDto };
