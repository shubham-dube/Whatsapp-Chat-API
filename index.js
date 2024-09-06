<?php
// webhook_display.php

$webhookUrl = "https://whatapp-api-cheak.onrender.com/webhook";

// Initialize cURL session for webhook URL
$ch = curl_init($webhookUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    $error = curl_error($ch);
    $data = [
        'status' => 'error',
        'message' => 'Failed to fetch data from webhook. cURL Error: ' . $error
    ];
    curl_close($ch);
} else {
    curl_close($ch);

    // Output raw response for debugging
    echo "<h2>Raw Response</h2>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";

    $data = json_decode($response, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        $data = [
            'status' => 'error',
            'message' => 'Failed to decode JSON response. Error: ' . json_last_error_msg()
        ];
    } elseif (!isset($data['status'])) {
        $data = [
            'status' => 'error',
            'message' => 'Unexpected JSON structure received.'
        ];
    }
}

// API URL for fetching messages
$apiUrl = "https://whatapp-api-cheak.onrender.com/messages";

// Initialize cURL session for messages API
$ch = curl_init($apiUrl);

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPGET, true);

// Execute cURL request and get the response
$response = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    echo 'cURL Error: ' . curl_error($ch);
} else {
    // Decode the JSON response
    $messages = json_decode($response, true);

    // Check if data was fetched successfully
    if (is_array($messages) && !empty($messages)) {
        foreach ($messages as $message) {
            echo "<p><strong>Message Body:</strong> " . htmlspecialchars($message['messageBody']) . "<br>";
            echo "<strong>Sender Number:</strong> " . htmlspecialchars($message['sender_Number']) . "</p>";
        }
    } else {
        echo "<p>No data found or unable to fetch data.</p>";
    }
}

// Close cURL session
curl_close($ch);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webhook Message Display</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>
<div class="container">
    <div id="messageDisplay">
        <?php if (isset($data['status']) && $data['status'] === 'success'): ?>
            <p><?php echo htmlspecialchars($data['body']); ?></p>
            <p>From: <?php echo htmlspecialchars($data['from']); ?></p>
        <?php else: ?>
            <p>Error: <?php echo htmlspecialchars($data['message']); ?></p>
        <?php endif; ?>
    </div>
</div>
</body>
</html>
