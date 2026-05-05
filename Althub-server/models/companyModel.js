import mongoose from "mongoose";

const company = new mongoose.Schema({
    name: {
        type: String,
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    website: {
        type: String
    },
    image: {
        type: String
    }
});

export default mongoose.model("CompanyTB", company);