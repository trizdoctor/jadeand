# 이미지 생성 요청 웹 애플리케이션

## Overview

This is a Korean-language web application that allows users to generate images by submitting two text messages. The application features a clean, modern interface where users can input two messages and send them to an external webhook service for image processing. The system provides real-time status updates and progress tracking during the image generation process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Pure HTML/CSS/JavaScript**: No frameworks or build tools, keeping the application lightweight and simple
- **Single Page Application**: All functionality contained within a single HTML page with dynamic content updates
- **Responsive Design**: Mobile-first approach with gradient background and modern UI components
- **Real-time Status Updates**: Dynamic status indicators with progress bars and loading states

### User Interface Components
- **Form-based Input**: Two text input fields for message collection with validation
- **Status Tracking System**: Visual progress indicators including dots, progress bars, and descriptive text
- **Error Handling Interface**: Dedicated error display section with retry functionality
- **Loading States**: Button animations and spinners to provide visual feedback

### State Management
- **Global Variables**: Simple state management using JavaScript globals for request tracking
- **Polling Mechanism**: Status checking starts after 5 seconds, then every 15 seconds for responsive updates
- **Request Key System**: Unique identifier tracking for each image generation request
- **Button State Management**: Send button remains disabled during entire request lifecycle to prevent overlapping requests

### Communication Architecture
- **Webhook Integration**: Direct HTTP POST requests to external Make.com webhook endpoint
- **Asynchronous Processing**: Non-blocking request handling with optimized status polling
- **Error Recovery**: Built-in retry mechanisms and user-friendly error messages

## External Dependencies

### Third-party Services
- **Make.com Webhook**: Primary integration endpoint at `https://hook.eu2.make.com/mb9x66g8vlqlsjzpl95nm9hckuevwjqn`
  - Handles image generation requests
  - Processes two input messages
  - Returns status updates and final image results

### Browser APIs
- **Fetch API**: For HTTP requests to the webhook service
- **DOM API**: For dynamic content manipulation and user interface updates
- **Form API**: For input validation and form submission handling

### Styling Dependencies
- **System Fonts**: Uses native system font stack for optimal performance
- **CSS Gradients**: Modern gradient backgrounds without external image dependencies
- **CSS Animations**: Built-in loading spinners and transitions

The application is designed to be completely self-contained with minimal external dependencies, focusing on reliability and simplicity while providing a polished user experience for Korean-speaking users.