/**
 * UI Components Showcase
 *
 * This file demonstrates all UI components with various configurations.
 * Use this as a reference for component usage patterns.
 */

import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Toggle,
  Badge,
  CountBadge,
  LoadingSpinner,
  Alert,
  Modal,
  Toast,
  SkeletonText,
  SkeletonCard,
  SkeletonCircle,
} from './index';

const ComponentShowcase: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState<string>('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(false);

  const selectOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            UI Components Library
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Production-ready components with TypeScript and accessibility
          </p>
        </header>

        {/* Buttons Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Buttons</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button fullWidth>Full Width</Button>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input
              label="Standard Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              label="Email Input"
              type="email"
              placeholder="you@example.com"
              leftIcon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />
            <Input
              label="Password Input"
              type="password"
              placeholder="Enter password"
              error="Password is required"
            />
            <Input
              label="Floating Label"
              placeholder="Type something..."
              floatingLabel
              helperText="This is helper text"
            />
          </div>
        </section>

        {/* Select Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Select</h2>
          <div className="space-y-4 max-w-md">
            <Select
              label="Choose an option"
              options={selectOptions}
              value={selectValue}
              onChange={(val) => setSelectValue(val as string)}
              placeholder="Select..."
            />
            <Select
              label="Searchable Select"
              options={selectOptions}
              searchable
              placeholder="Search options..."
            />
          </div>
        </section>

        {/* Checkbox & Toggle Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Checkbox & Toggle
          </h2>
          <div className="space-y-6 max-w-md">
            <div className="space-y-3">
              <Checkbox
                label="Accept terms and conditions"
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
              />
              <Checkbox label="Subscribe to newsletter" helperText="Get weekly updates" />
              <Checkbox label="Disabled checkbox" disabled />
              <Checkbox label="Indeterminate state" indeterminate />
            </div>
            <div className="space-y-3">
              <Toggle
                label="Enable notifications"
                checked={toggleChecked}
                onChange={setToggleChecked}
              />
              <Toggle label="Dark mode" labelPosition="start" />
              <Toggle
                label="Auto-save"
                helperText="Automatically save your work"
                error="Feature unavailable"
              />
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Badges</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Badge dot>New</Badge>
              <Badge variant="success" dot>
                Updated
              </Badge>
              <Badge variant="danger" dot>
                Critical
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <CountBadge count={5} />
              <CountBadge count={150} maxCount={99} />
              <CountBadge count={0} showZero />
              <div className="relative inline-flex">
                <Button>Notifications</Button>
                <span className="absolute -top-2 -right-2">
                  <CountBadge count={3} />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Loading States */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Loading States
          </h2>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-6 items-center">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
              <LoadingSpinner size="xl" />
            </div>
            <div className="flex flex-wrap gap-6 items-center">
              <LoadingSpinner color="primary" />
              <LoadingSpinner color="white" className="bg-gray-800 p-2 rounded" />
              <LoadingSpinner color="secondary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Skeleton Loaders</h3>
              <SkeletonCard />
              <div className="flex items-center space-x-4">
                <SkeletonCircle size={48} />
                <div className="flex-1">
                  <SkeletonText lines={2} width={['60%', '40%']} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Alerts</h2>
          <div className="space-y-4">
            <Alert variant="info" title="Information">
              This is an informational message for the user.
            </Alert>
            <Alert variant="success" title="Success!" dismissible>
              Your changes have been saved successfully.
            </Alert>
            <Alert variant="warning" title="Warning">
              Please review your changes before proceeding.
            </Alert>
            <Alert variant="error" title="Error">
              Something went wrong. Please try again later.
            </Alert>
          </div>
        </section>

        {/* Modal Trigger */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Modal</h2>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        </section>

        {/* Toast Example */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Toast Example
          </h2>
          <div className="max-w-sm">
            <Toast
              id="example-toast"
              variant="success"
              title="Success!"
              message="Your action was completed successfully"
              duration={5000}
              showProgress
              action={{
                label: 'Undo',
                onClick: () => { /* undo action */ },
              }}
            />
          </div>
        </section>

        <footer className="text-center text-gray-600 dark:text-gray-400 py-8">
          <p>UI Components Library - Production Ready</p>
          <p className="text-sm mt-2">Built with TypeScript, React, and Tailwind CSS</p>
        </footer>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example Modal"
        size="md"
        footer={
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            This is an example modal dialog with focus trap, keyboard navigation, and accessibility
            features.
          </p>
          <Input label="Enter details" placeholder="Type something..." />
          <Checkbox label="Remember this choice" />
        </div>
      </Modal>
    </div>
  );
};

export default ComponentShowcase;
