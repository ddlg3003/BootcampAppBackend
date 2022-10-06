// @desc    Get all bootcamps  
// @route   [GET] /api/v1/bootcamps
// @access  Public
export const getBootcamps = (req, res) => {
    res.status(200).json({ success: true, data: ['course A', 'course B', 'course C'] });
}

// @desc    Get single bootcamp  
// @route   [GET] /api/v1/bootcamps/:id
// @access  Public
export const getBootcamp = (req, res) => {
    res.status(200).json({ success: true, data: 'course A' });
}

// @desc    Create bootcamp  
// @route   [POST] /api/v1/bootcamps
// @access  Private
export const createBootcamp = (req, res) => {
    res.status(201).json({ success: true, msg: 'created' });
}

// @desc    Update bootcamp  
// @route   [PUT] /api/v1/bootcamps/:id
// @access  Private
export const updateBootcamp = (req, res) => {
    res.status(200).json({ success: true, msg: `updated ${req.params.id}` });
}

// @desc    Delete bootcamp  
// @route   [DELETE] /api/v1/bootcamps/:id
// @access  Private
export const deleteBootcamp = (req, res) => {
    res.status(200).json({ success: true, msg: `deleted ${req.params.id}` });
}
