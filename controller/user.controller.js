import bcrypt from "bcrypt"
import User from "../model/User.js"

export const createUserController = async (req, res) => {
    const { email, username, phoneNumber, password } = req.body
    if (!email || !username || !phoneNumber || !password) {
        return res.status(400).json({ message: "please fill in all the data fields", user: null })
    }

    try {
        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({ message: "user with the email already exists", user: null })
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = new User({ email, username, phoneNumber, password: hashedPassword })
        await newUser.save()
        return res.status(200).json({ message: "user creeated successfully", user: newUser })

    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error", user: null })

    }
}
export const loginController = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ message: "please fill in all the data fields", isAuthenticated: false })
    }
    try {
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res.status(401).json({ message: "user not found", isAuthenticated: false })
        }
        const matchPassword = await bcrypt.compare(password, existingUser.password)
        if (!matchPassword) {
            return res.status(401).json({ message: "invalid username or password", isAuthenticated: false })
        }
        return res.status(200).json({ message: "logged in successfully", isAuthenticated: true })


    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error", isAuthenticated: false })
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find()
        if (!allUsers) {
            return res.status(400).json({ message: "no users found", users: null })
        }
        return res.status(200).json({ message: " users found", users: allUsers })
    }
    catch (e) {
        return res.status(400).json({ message: "server error", users: null })
    }
}
export const updateUserController = async (req, res) => {
    try {
        console.log(req.body)
        const userId = req.params.id
        const { email, username, phoneNumber, password } = req.body

        let updateData = {}

        if (email) {
            const existingUserwithEmail = await User.findOne({ email, _id: { $ne: userId } })
            if (existingUserwithEmail) {
                return res.status(500).json({ message: "user with that email already exists so use another email ", updatedUser: null })
            }
            updateData.email = email
        }
        if (username) updateData.username = username
        if (phoneNumber) updateData.phoneNumber = phoneNumber
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 12)
            updateData.password = hashedPassword
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
        return res.status(201).json({ message: "user updated successfully ", updatedUser: updatedUser })

    }
    catch (e) {
        console.log(e)
        return res.status(400).json({ message: "server error", updatedUser: null })

    }
}

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id
        await User.findByIdAndDelete(userId)
        return res.status(200).json({ message: " users deleted successfully" })
    }
    catch (e) {
        return res.status(400).json({ message: "server error", users: null })
    }
}
