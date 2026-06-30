import mongoose from "mongoose"


const connectDB = async() => {
    try{
        await mongoose.connect(process.env.DBURL)
        console.log("Database connection successful.")
        
    }catch(err){
        console.log("Database connection failed.")
        process.exit(1)
    }
}
export default connectDB;