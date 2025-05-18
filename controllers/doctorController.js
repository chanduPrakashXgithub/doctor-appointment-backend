import Doctor from "../models/Doctor.js";

export const addDoctor = async (req, res) => {
  try {
    const { name, specialization } = req.body;

    const existingDoctor = await Doctor.findOne({ name, specialization });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor with this specialization already exists" });
    }

    const doctor = new Doctor(req.body);
    await doctor.save();

    res.status(201).json({ message: "Doctor added successfully", doctor });
  } catch (error) {
    console.error("Add Doctor Error:", error);
    res.status(500).json({ message: "Failed to add doctor", error: error.message });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Get Doctors Error:", error);
    res.status(500).json({ message: "Failed to get doctors", error: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Get Doctor by ID Error:", error);
    res.status(500).json({ message: "Failed to get doctor by ID", error: error.message });
  }
};
