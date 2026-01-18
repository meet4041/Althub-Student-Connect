import mongoose from "mongoose";

const financialaid = new mongoose.Schema({
    // NEW FIELD: Crucial for linking records by ID
    instituteid: {
        type: String,
        required: true
    },
    institutename: {
        type: String,
    },
    name: {
        type: String,
    },
    image: {
        type: String,
    },
    aid: {
        type: String,
    },
    claimed: {
        type: String,
    },
    description: {
        type: String,
    },
    dueDate: {
        type: Date
    }
});

export default mongoose.model("FinancialAidTB", financialaid);