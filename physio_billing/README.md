# Welcome to your Expo app 👋

# Physiotherapy Billing App

A simple, offline-first billing application designed specifically for physiotherapy clinics. Built with React Native and Expo for cross-platform compatibility.

## Features

- **Patient Management**: Add, edit, delete, and search patients with contact information
- **Service Management**: Manage your physiotherapy services with pricing
- **Invoice Generation**: Create professional invoices with automatic calculations
- **PDF Export**: Generate and share invoices as PDF documents
- **Reports & Analytics**: View revenue summaries and outstanding payments
- **Offline-First**: All data stored locally for complete privacy
- **No Subscription**: One-time setup, no recurring fees

## Tech Stack

- **React Native** with **Expo** for cross-platform mobile development
- **TypeScript** for type safety and better developer experience
- **Zustand** for lightweight state management
- **AsyncStorage** for local data persistence
- **jsPDF** for PDF generation
- **Expo File System & Sharing** for document handling

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator, `a` for Android emulator
   - Or press `w` to run in web browser

## Project Structure

```
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── patients.tsx   # Patient management
│   │   ├── services.tsx   # Service management
│   │   ├── reports.tsx    # Reports & analytics
│   │   └── explore.tsx    # Settings
│   ├── invoice/           # Invoice-related screens
│   │   ├── create.tsx     # Create new invoice
│   │   └── [id].tsx       # Invoice details
│   └── _layout.tsx        # Root navigation layout
├── components/            # Reusable UI components
│   └── ui/               # Core UI components
├── store/                # State management
│   └── billingStore.ts   # Main Zustand store
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
│   └── pdfGenerator.ts   # PDF generation logic
└── package.json
```

## Key Components

### State Management (`store/billingStore.ts`)
- Centralized state using Zustand
- Automatic persistence with AsyncStorage
- Type-safe actions for all CRUD operations
- Utility functions for calculations and data retrieval

### UI Components (`components/ui/`)
- **Button**: Configurable button with variants and loading states
- **Input**: Form input with validation and error handling
- **Card**: Consistent card layout for content sections
- **Modal**: Full-screen modal for forms and selections
- **SearchBar**: Searchable input component

### PDF Generation (`utils/pdfGenerator.ts`)
- Professional invoice PDF generation
- Customizable clinic information
- Automatic calculations and formatting
- Share functionality for WhatsApp/Email

## Usage

### Getting Started
1. **Add Services**: Go to Services tab and add your physiotherapy services with prices
2. **Add Patients**: Use Patients tab to add patient information
3. **Create Invoices**: Use Dashboard "New Invoice" or navigate to create invoice screen
4. **Generate PDFs**: From invoice details, generate and share professional PDFs
5. **View Reports**: Check Reports tab for revenue summaries and outstanding payments

### Data Management
- All data is stored locally on your device
- Use Settings tab to export/import data (backup functionality)
- No internet connection required for normal operation

### Customization
- Update clinic information in Settings tab
- Modify PDF template in `utils/pdfGenerator.ts`
- Adjust styling in component StyleSheet objects

## Development

### Adding New Features
1. Create new components in `components/` directory
2. Add new screens in `app/` directory following existing patterns
3. Extend store actions in `store/billingStore.ts`
4. Update TypeScript types in `types/index.ts`

### Code Quality
- TypeScript for type safety
- Consistent component patterns
- Reusable UI components
- Clean separation of concerns
- Proper error handling

## Building for Production

```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android

# Create development build
npx expo install --fix
eas build --platform all
```

## Privacy & Security

- **Offline-First**: No data sent to external servers
- **Local Storage**: All information stored on device only
- **No Analytics**: No tracking or data collection
- **HIPAA Considerations**: Suitable for healthcare data with proper device security

## Support

For issues or feature requests:
1. Check existing documentation
2. Review code comments and TypeScript types
3. Test in development environment first
4. Ensure all dependencies are properly installed

## License

This project is for educational and professional use. Modify as needed for your specific requirements.
