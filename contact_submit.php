<?php
declare(strict_types=1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);
    exit;
}

$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request payload.'
    ]);
    exit;
}

function clean_input(array $payload, string $key): string
{
    return trim((string)($payload[$key] ?? ''));
}

$name = clean_input($payload, 'name');
$surname = clean_input($payload, 'surname');
$phone = clean_input($payload, 'phone');
$email = clean_input($payload, 'email');
$subject = clean_input($payload, 'subject');
$message = clean_input($payload, 'message');

if (
    $name === '' ||
    $surname === '' ||
    $phone === '' ||
    $email === '' ||
    $subject === '' ||
    $message === ''
) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address.'
    ]);
    exit;
}

$recipient = 'info@thebrandhouse.mu';
$safeSubject = 'Website contact: ' . preg_replace('/[\r\n]+/', ' ', $subject);
$emailBody = implode(PHP_EOL, [
    'A new website contact form submission has been received.',
    '',
    'Name: ' . $name . ' ' . $surname,
    'Phone number: ' . $phone,
    'Email: ' . $email,
    '',
    'Message:',
    $message,
]);

$headers = [
    'From: TheBrandHouse Website <no-reply@thebrandhouse.mu>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];

$storageDir = __DIR__ . DIRECTORY_SEPARATOR . 'storage';
$storageFile = $storageDir . DIRECTORY_SEPARATOR . 'contact_messages.jsonl';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0775, true);
}

$record = [
    'submitted_at' => gmdate('c'),
    'name' => $name,
    'surname' => $surname,
    'phone' => $phone,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
];

file_put_contents(
    $storageFile,
    json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

$mailSent = @mail($recipient, $safeSubject, $emailBody, implode("\r\n", $headers));

echo json_encode([
    'success' => true,
    'message' => $mailSent
        ? 'Message received and email sent successfully.'
        : 'Message received successfully.'
]);
