const express = require('express');
const router = express.Router();
const { User, UserInfo } = require('../models/userModel');

// Get all staff
router.get('/staff', async (req, res) => {
    try {
        // In a real implementation, we would query both User and UserInfo models
        // Here's how it would look with Mongoose:
        /*
        const staffUsers = await User.find({ u_role: 'staff' })
            .populate('info')
            .select('name email status profile_image')
            .lean();
            
        const staffData = staffUsers.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            age: calculateAge(user.info?.birthdate),
            address: user.info?.address || 'N/A',
            contact: user.info?.contact || 'N/A',
            assignedFloor: user.info?.assign_area || 'N/A',
            gender: user.info?.gender || 'N/A',
            status: user.status || 'inactive',
            profileImage: user.profile_image
        }));
        */
        
        // Mock data for demonstration
        const staffData = [
            {
                id: '1001',
                name: 'John Smith',
                email: 'john@example.com',
                age: '28',
                address: '123 Main St, Manila, Philippines',
                contact: '+639171234567',
                assignedFloor: '1',
                status: 'active',
                gender: 'Male',
                profileImage: '/image/profile.jpg'
            },
            {
                id: '1002',
                name: 'Jane Doe',
                email: 'jane@example.com',
                age: '32',
                address: '789 Bonifacio Blvd, Cebu City, Philippines',
                contact: '+639191234567',
                assignedFloor: '2',
                status: 'inactive',
                gender: 'Female',
                profileImage: '/image/profile2.jpg'
            },
            {
                id: '1003',
                name: 'Angel Anuba',
                email: 'angel@example.com',
                age: '27',
                address: '321 Luna St, Davao City, Philippines',
                contact: '+639201234567',
                assignedFloor: '4',
                status: 'active',
                gender: 'Female',
                profileImage: '/image/profile3.jpg'
            }
        ];
        
        res.json(staffData);
    } catch (error) {
        console.error('Error fetching staff data:', error);
        res.status(500).json({ message: 'Failed to fetch staff data' });
    }
});

// Helper function to calculate age from birthdate
function calculateAge(birthdate) {
    if (!birthdate) return 'N/A';
    
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    
    // Check if birthday hasn't occurred yet this year
    if (
        today.getMonth() < birth.getMonth() || 
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) {
        age--;
    }
    
    return age.toString();
}

// Get staff by ID
router.get('/staff/:id', async (req, res) => {
    try {
        const staffId = req.params.id;
        
        // Real implementation would look like:
        /*
        const user = await User.findById(staffId)
            .populate('info')
            .select('name email status profile_image')
            .lean();
            
        if (!user) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        
        const staffData = {
            id: user._id,
            name: user.name,
            email: user.email,
            age: calculateAge(user.info?.birthdate),
            address: user.info?.address || 'N/A',
            contact: user.info?.contact || 'N/A',
            assignedFloor: user.info?.assign_area || 'N/A',
            gender: user.info?.gender || 'N/A',
            status: user.status || 'inactive',
            profileImage: user.profile_image
        };
        */
        
        // Mock data for demonstration
        let staffData;
        if (staffId === '1001') {
            staffData = {
                id: '1001',
                name: 'John Smith',
                email: 'john@example.com',
                age: '28',
                address: '123 Main St, Manila, Philippines',
                contact: '+639171234567',
                assignedFloor: '1',
                status: 'active',
                gender: 'Male',
                profileImage: '/image/profile.jpg'
            };
        } else if (staffId === '1002') {
            staffData = {
                id: '1002',
                name: 'Jane Doe',
                email: 'jane@example.com',
                age: '32',
                address: '789 Bonifacio Blvd, Cebu City, Philippines',
                contact: '+639191234567',
                assignedFloor: '2',
                status: 'inactive',
                gender: 'Female',
                profileImage: '/image/profile2.jpg'
            };
        } else if (staffId === '1003') {
            staffData = {
                id: '1003',
                name: 'Angel Anuba',
                email: 'angel@example.com',
                age: '27',
                address: '321 Luna St, Davao City, Philippines',
                contact: '+639201234567',
                assignedFloor: '4',
                status: 'active',
                gender: 'Female',
                profileImage: '/image/profile3.jpg'
            };
        } else {
            staffData = {
                id: staffId,
                name: 'Staff Member',
                email: 'staff@example.com',
                age: '30',
                address: 'Unknown Address',
                contact: '+639001234567',
                assignedFloor: '1',
                status: 'inactive',
                gender: 'Male',
                profileImage: '/image/profile2.jpg'
            };
        }
        
        res.json(staffData);
    } catch (error) {
        console.error('Error fetching staff details:', error);
        res.status(500).json({ message: 'Failed to fetch staff details' });
    }
});

// Update staff
router.patch('/staff/:id', async (req, res) => {
    try {
        const staffId = req.params.id;
        const { assignedFloor } = req.body;
        
        console.log(`Updating staff ${staffId} with floor ${assignedFloor}`);
        
        // Real implementation would look like:
        /*
        const userInfo = await UserInfo.findOneAndUpdate(
            { user: staffId },
            { assign_area: assignedFloor },
            { new: true }
        );
        
        if (!userInfo) {
            return res.status(404).json({ message: 'Staff information not found' });
        }
        */
        
        // Mock success response
        res.json({ message: 'Staff assigned floor updated successfully' });
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({ message: 'Failed to update staff' });
    }
});

// Delete staff
router.delete('/staff/:id', async (req, res) => {
    try {
        const staffId = req.params.id;
        
        console.log(`Deleting staff ${staffId}`);
        
        // Real implementation would look like:
        /*
        // Delete user info first
        await UserInfo.deleteOne({ user: staffId });
        
        // Then delete the user
        const result = await User.deleteOne({ _id: staffId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        */
        
        // Mock success response
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({ message: 'Failed to delete staff' });
    }
});

module.exports = router; 