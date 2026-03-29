@authentication @critical
Feature: User Authentication
  As a user
  I want to register, login, and manage my account
  So that I can access personalized astrology features

  Background:
    Given I am on the "home" page

  # Registration Scenarios
  @registration @smoke
  Scenario: New user registration with valid data
    Given I am a new user
    When I click on "Get Started"
    And I register with the following details:
      | Name            | Email                    | Password        | Confirm Password | Terms of Service |
      | John Doe        | john.doe@example.com     | TestPassword123 | TestPassword123  | accepted         |
    And I submit the registration form
    Then my account should be created
    And I should be logged in automatically
    And I should see a welcome message

  @registration @validation
  Scenario Outline: Registration validation - required fields
    Given I am a new user
    When I click on "Get Started"
    And I register with the following details:
      | Name            | Email          | Password        | Confirm Password | Terms of Service |
      | <name>          | <email>        | <password>      | <confirm>        | <terms>          |
    And I submit the registration form
    Then I should see an error message "<error>"

    Examples:
      | name      | email              | password        | confirm          | terms    | error                  |
      |           | test@example.com   | TestPassword123 | TestPassword123  | accepted | Name is required       |
      | John Doe  |                    | TestPassword123 | TestPassword123  | accepted | Email is required      |
      | John Doe  | test@example.com   |                 |                  | accepted | Password is required   |
      | John Doe  | test@example.com   | TestPassword123 |                  | accepted | Password is required   |
      | John Doe  | test@example.com   | TestPassword123 | TestPassword123  |          | Accept terms of service|

  @registration @validation
  Scenario Outline: Registration validation - invalid email format
    Given I am a new user
    When I click on "Get Started"
    And I register with the following details:
      | Name     | Email           | Password        | Confirm Password | Terms of Service |
      | John Doe | <email>         | TestPassword123 | TestPassword123  | accepted         |
    And I submit the registration form
    Then I should see an error message "Invalid email format"

    Examples:
      | email            |
      | invalid          |
      | @example.com     |
      | test@            |
      | test@example     |
      | test..user@ex.co |

  @registration @validation @security
  Scenario Outline: Registration validation - weak passwords
    Given I am a new user
    When I click on "Get Started"
    And I register with the following details:
      | Name     | Email                | Password | Confirm Password | Terms of Service |
      | John Doe | test@example.com     | <password> | <password>     | accepted         |
    And I submit the registration form
    Then I should see an error message "Password must be at least 8 characters"

    Examples:
      | password  |
      | 123       |
      | abc       |
      | pass      |
      | weak      |

  @registration @validation
  Scenario: Registration validation - password mismatch
    Given I am a new user
    When I click on "Get Started"
    And I register with the following details:
      | Name     | Email            | Password        | Confirm Password | Terms of Service |
      | John Doe | test@example.com | TestPassword123 | DifferentPass123 | accepted         |
    And I submit the registration form
    Then I should see an error message "Passwords do not match"

  @registration @duplicate
  Scenario: Registration with existing email
    Given I am an existing user
    And I am on the "register" page
    When I register with the following details:
      | Name     | Email                    | Password        | Confirm Password | Terms of Service |
      | John Doe | <existing_user.email>    | TestPassword123 | TestPassword123  | accepted         |
    And I submit the registration form
    Then I should see an error message "Email already exists"

  # Login Scenarios
  @login @smoke
  Scenario: Successful login with valid credentials
    Given I am an existing user
    And I am on the "login" page
    When I enter my email "<existing_user.email>"
    And I enter my password "<existing_user.password>"
    And I submit the login form
    Then I should be on the "dashboard" page
    And I should see "Welcome back"

  @login @validation
  Scenario Outline: Login validation - empty fields
    Given I am on the "login" page
    When I enter my email "<email>"
    And I enter my password "<password>"
    And I submit the login form
    Then I should see an error message "<error>"

    Examples:
      | email              | password | error              |
      |                    | pass123  | Email is required  |
      | test@example.com   |          | Password is required|
      |                    |          | Email is required  |

  @login @security
  Scenario: Login with invalid credentials
    Given I am on the "login" page
    When I login with invalid credentials
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  @login @security
  Scenario: Login rate limiting after failed attempts
    Given I am on the "login" page
    When I attempt login with wrong password 5 times
    Then I should see an error message "Too many attempts"

  @login @ux
  Scenario: Password visibility toggle
    Given I am on the "login" page
    When I enter my password "TestPassword123"
    And I click on the password visibility toggle
    Then the password field should show plain text
    When I click on the password visibility toggle again
    Then the password field should show masked text

  @login @remember
  Scenario: Remember me functionality
    Given I am an existing user
    And I am on the "login" page
    When I enter my email "<existing_user.email>"
    And I enter my password "<existing_user.password>"
    And I check "Remember me"
    And I submit the login form
    Then I should be on the "dashboard" page
    When I close the browser and reopen
    Then I should still be logged in

  # Session Management
  @session @smoke
  Scenario: Session persistence across page reloads
    Given I am logged in
    When I refresh the page
    Then I should still be logged in

  @session @smoke
  Scenario: Session persistence across tabs
    Given I am logged in
    When I open a new tab
    And I navigate to the "dashboard" page
    Then I should be logged in in the new tab

  @logout @smoke
  Scenario: Successful logout
    Given I am logged in
    When I click the "Logout" button
    Then I should be logged out
    And I should be on the "home" page

  @logout @security
  Scenario: Logout clears session data
    Given I am logged in
    When I logout
    And I try to access the "dashboard" page
    Then I should be redirected to the "login" page

  # Password Reset
  @password-reset @smoke
  Scenario: Request password reset
    Given I am an existing user
    And I am on the "forgot password" page
    When I enter my email "<existing_user.email>"
    And I click the "Send Reset Link" button
    Then I should receive a password reset email

  @password-reset @validation
  Scenario: Password reset with invalid email
    Given I am on the "forgot password" page
    When I enter my email "nonexistent@example.com"
    And I click the "Send Reset Link" button
    Then I should see an error message "No account found"

  @password-reset @flow
  Scenario: Complete password reset flow
    Given I have requested a password reset
    When I click the reset link in the email
    And I enter a new password "NewPassword123"
    And I confirm the new password "NewPassword123"
    And I submit the new password
    Then I should see "Password updated successfully"
    When I login with the new password
    Then I should be on the "dashboard" page

  # Protected Routes
  @protected-routes @security
  Scenario Outline: Unauthenticated access to protected routes
    Given I am not logged in
    When I navigate to "<route>"
    Then I should be redirected to the "login" page

    Examples:
      | route           |
      | /dashboard      |
      | /charts         |
      | /charts/create  |
      | /profile        |
      | /calendar       |
      | /synastry       |
      | /transits       |

  @protected-routes @ux
  Scenario: Redirect to intended page after login
    Given I am not logged in
    When I navigate to "/charts/create"
    Then I should be redirected to the "login" page
    When I login with valid credentials
    Then I should be on the "chart creation" page

  # Social Authentication
  @social-auth @integration
  Scenario: Google authentication
    Given I am on the "login" page
    When I click "Google" login
    Then I should be redirected to "accounts.google.com"
    When I authorize with Google
    Then I should be on the "dashboard" page

  @social-auth @integration
  Scenario: Apple authentication
    Given I am on the "login" page
    When I click "Apple" login
    Then I should be redirected to "appleid.apple.com"
    When I authorize with Apple
    Then I should be on the "dashboard" page

  # Multi-device Scenarios
  @multi-device @session
  Scenario: Logout from one device logs out all devices
    Given I am logged in on device A
    And I am logged in on device B
    When I logout on device A
    Then I should be logged out on device B

  # Account Management
  @account @profile
  Scenario: Update account email
    Given I am logged in
    And I am on the "profile" page
    When I click "Change Email"
    And I enter a new email "newemail@example.com"
    And I enter my current password "<current_user.password>"
    And I submit the change
    Then I should see "Email updated successfully"

  @account @profile
  Scenario: Update account password
    Given I am logged in
    And I am on the "profile" page
    When I click "Change Password"
    And I enter my current password "<current_user.password>"
    And I enter a new password "NewSecurePassword123"
    And I confirm the new password "NewSecurePassword123"
    And I submit the change
    Then I should see "Password updated successfully"

  @account @security
  Scenario: Delete account
    Given I am logged in
    And I am on the "profile" page
    When I click "Delete Account"
    And I confirm account deletion
    Then my account should be deleted
    And I should be on the "home" page

  # Accessibility
  @accessibility @a11y
  Scenario: Login page keyboard navigation
    Given I am on the "login" page
    When I press "Tab"
    Then the email field should be focused
    When I press "Tab"
    Then the password field should be focused
    When I press "Tab"
    Then the login button should be focused
    When I press "Enter"
    Then the login form should be submitted

  @accessibility @a11y
  Scenario: Registration form screen reader announcements
    Given I am using a screen reader
    And I am on the "register" page
    When I submit the registration form with empty fields
    Then I should hear "Name is required"
    And I should hear "Email is required"
    And I should hear "Password is required"

  # Responsive Design
  @responsive @mobile
  Scenario: Login page mobile layout
    Given I am using a mobile device
    When I navigate to the "login" page
    Then the login form should be full width
    And the social login buttons should be stacked vertically

  @responsive @tablet
  Scenario: Login page tablet layout
    Given I am using a tablet device
    When I navigate to the "login" page
    Then the login form should be centered
    And the social login buttons should be side by side
