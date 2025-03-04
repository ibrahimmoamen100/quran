<?php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$file = '../data/students.json';
$uploadDir = '../public/uploads/';

// Function to generate a unique filename
function generateUniqueFilename($filename) {
    $extension = pathinfo($filename, PATHINFO_EXTENSION);
    $basename = pathinfo($filename, PATHINFO_FILENAME);
    $uniqueName = uniqid() . '-' . $basename . '.' . $extension;
    return $uniqueName;
}

// Function to handle file uploads
function handleFileUpload($file, $uploadDir) {
    error_log('File upload details: ' . json_encode($file));
    if ($file['error'] === UPLOAD_ERR_OK) {
        $uniqueFilename = generateUniqueFilename($file['name']);
        $targetPath = $uploadDir . $uniqueFilename;
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return '/uploads/' . $uniqueFilename;
        }
    }
    return null;
}

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle PUT request (for updating student data)
if ($method === 'PUT') {
    // Get the student ID from the URL
    $studentId = basename($_SERVER['REQUEST_URI']);
    
    // Get the authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;
    
    // Verify the token (replace with your actual token verification logic)
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    $token = $matches[1];
    // In a real application, you would verify the token here
    // For this example, we'll just assume the token is valid

    // Read existing data
    $students = json_decode(file_get_contents($file), true);
    if (!is_array($students)) {
        $students = [];
    }

    // Get the request body
    $requestBody = file_get_contents('php://input');
    $studentData = json_decode($requestBody, true);

    // Handle file uploads
    $uploadedFiles = isset($_FILES['certificates']) ? $_FILES['certificates'] : [];
    $certificatePaths = [];
    if (is_array($uploadedFiles['name'])) {
        foreach ($uploadedFiles['name'] as $key => $name) {
            $file = [
                'name' => $name,
                'type' => $uploadedFiles['type'][$key],
                'tmp_name' => $uploadedFiles['tmp_name'][$key],
                'error' => $uploadedFiles['error'][$key],
                'size' => $uploadedFiles['size'][$key],
            ];
            $imagePath = handleFileUpload($file, $uploadDir);
            if ($imagePath) {
                $certificatePaths[] = $imagePath;
            }
        }
    }
    if (!empty($certificatePaths)) {
        $studentData['certificates'] = $certificatePaths;
    }
    
    // Handle main photo upload
    $uploadedFile = isset($_FILES['photo']) ? $_FILES['photo'] : null;
    if ($uploadedFile) {
        $imagePath = handleFileUpload($uploadedFile, $uploadDir);
        if ($imagePath) {
            $studentData['photo'] = $imagePath;
        }
    }
    
    // Log student data after file uploads
    error_log('Student data after file uploads: ' . json_encode($studentData));

    // Find the student to update
    $studentUpdated = false;
    foreach ($students as $key => $student) {
       if ($student['id'] == $studentId) {
            // Log student data before overwrite
            error_log('Student data before overwrite: ' . json_encode($student));
            
            $students[$key] = $studentData;
            
            // Log student data after overwrite
            error_log('Student data after overwrite: ' . json_encode($students[$key]));
            
            $studentUpdated = true;
            break;
        }
    }
    error_log('Students array after loop: ' . json_encode($students));

    if ($studentUpdated) {
        // Save updated data
        if (file_put_contents($file, json_encode($students, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save data', 'details' => error_get_last()]);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Student not found', 'studentId' => $studentId]);
    }
}
// Handle POST request (for adding new student)
elseif ($method === 'POST') {
    // Read existing data
    $students = json_decode(file_get_contents($file), true);
    if (!is_array($students)) {
        $students = [];
    }
    
    // Get the request body
    $studentData = $_POST;
    
    // Handle file upload
    $uploadedFile = isset($_FILES['photo']) ? $_FILES['photo'] : null;
    if ($uploadedFile) {
        $imagePath = handleFileUpload($uploadedFile, $uploadDir);
        if ($imagePath) {
            $studentData['photo'] = $imagePath;
        }
    }
    
    // Generate a unique ID for the new student
    $studentData['id'] = uniqid();
    
    // Add the new student to the array
    $students[] = $studentData;
    
    // Save updated data
    if (file_put_contents($file, json_encode($students, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save data']);
    }
}
// Handle DELETE request (for deleting a student)
elseif ($method === 'DELETE') {
    // Get the student ID from the URL
    $studentId = basename($_SERVER['REQUEST_URI']);
    
    // Get the authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;
    
    // Verify the token (replace with your actual token verification logic)
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    $token = $matches[1];
    // In a real application, you would verify the token here
    // For this example, we'll just assume the token is valid

    // Read existing data
    $students = json_decode(file_get_contents($file), true);
    if (!is_array($students)) {
        $students = [];
    }

    // Find the student to delete
    $studentDeleted = false;
    foreach ($students as $key => $student) {
        if ($student['id'] == $studentId) {
            // Remove the student from the array
            array_splice($students, $key, 1);
            $studentDeleted = true;
            break;
        }
    }

    if ($studentDeleted) {
        // Save updated data
        if (file_put_contents($file, json_encode($students, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save data']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Student not found']);
    }
}
else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
?>
