<?php

$vendorPath = dirname(__DIR__) . '/vendor';

if (!is_dir($vendorPath)) {
    die("Vendor directory not found at $vendorPath");
}

// Fix root vendor directory
chmod($vendorPath, 0755);

$count = 0;
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($vendorPath, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);

foreach ($iterator as $item) {
    if ($item->isDir()) {
        chmod($item->getPathname(), 0755);
    } else {
        chmod($item->getPathname(), 0644);
    }
    $count++;
}

echo "Successfully fixed permissions for $count files and folders inside vendor!";
