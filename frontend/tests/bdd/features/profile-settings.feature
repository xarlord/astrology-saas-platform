@profile @settings @account
Feature: User Profile and Settings
  As a registered user
  I want to manage my profile and account settings
  So that I can keep my information up to date

  Background:
    Given I am logged in

  # Profile Viewing
  @profile @smoke
  Scenario: View profile information
    Given I am on the "profile" page
    Then I should see my profile information including:
      | Field     |
      | Name      |
      | Email     |
      | Join Date |
      | Plan      |

  @profile @charts
  Scenario: View profile with chart statistics
    Given I have 5 saved charts
    And I am on the "profile" page
    Then I should see "5 saved charts"
    And I should see my chart creation history

  # Profile Editing
  @profile @edit
  Scenario: Update profile name
    Given I am on the "profile" page
    When I click "Edit Profile"
    And I update my name to "New Name"
    And I save the changes
    Then I should see "Profile updated successfully"
    And I should see "New Name" on my profile

  @profile @edit
  Scenario: Update profile bio
    Given I am on the "profile" page
    When I click "Edit Profile"
    And I enter a bio "I love astrology!"
    And I save the changes
    Then I should see my bio on my profile

  # Email Management
  @email @security
  Scenario: Change email address
    Given I am on the "profile" page
    When I click "Change Email"
    And I enter a new email "newemail@example.com"
    And I confirm with my password
    And I submit the change
    Then I should see "Verification email sent"
    When I verify the new email
    Then my email should be updated

  @email @validation
  Scenario: Cannot change to existing email
    Given I am on the "profile" page
    When I click "Change Email"
    And I enter an email that is already registered
    And I submit the change
    Then I should see "Email already in use"

  # Password Management
  @password @security
  Scenario: Change password
    Given I am on the "profile" page
    When I click "Change Password"
    And I enter my current password
    And I enter a new password "NewSecurePass123!"
    And I confirm the new password
    And I submit the change
    Then I should see "Password updated successfully"
    When I login with the new password
    Then I should be on the "dashboard" page

  @password @validation
  Scenario: Password change with wrong current password
    Given I am on the "profile" page
    When I click "Change Password"
    And I enter the wrong current password
    And I enter a new password
    And I submit the change
    Then I should see "Current password is incorrect"

  # Subscription Management
  @subscription @billing
  Scenario: View current subscription
    Given I am a premium user
    And I am on the "profile" page
    Then I should see my subscription details:
      | Detail        |
      | Plan Name    |
      | Start Date   |
      | Renewal Date |
      | Price        |

  @subscription @upgrade
  Scenario: Upgrade subscription
    Given I am a free user
    And I am on the "profile" page
    When I click "Upgrade to Premium"
    Then I should be redirected to the billing page
    When I complete the payment
    Then I should see "Welcome to Premium"
    And I should have premium features unlocked

  @subscription @cancel
  Scenario: Cancel subscription
    Given I am a premium user
    And I am on the "profile" page
    When I click "Manage Subscription"
    And I click "Cancel Subscription"
    And I confirm cancellation
    Then I should see "Subscription cancelled"
    And I should see the end date of my premium access

  # Notification Settings
  @notifications @settings
  Scenario: Update notification preferences
    Given I am on the "settings" page
    When I navigate to "Notifications"
    And I enable email notifications for transits
    And I disable marketing emails
    And I save the settings
    Then I should see "Settings saved"
    And I should receive transit emails
    And I should not receive marketing emails

  @notifications @push
  Scenario: Enable push notifications
    Given I am on the "settings" page
    When I navigate to "Notifications"
    And I enable push notifications
    And I grant permission
    Then I should see "Push notifications enabled"

  # Privacy Settings
  @privacy @settings
  Scenario: Update privacy settings
    Given I am on the "settings" page
    When I navigate to "Privacy"
    And I set my profile to private
    And I disable data sharing
    And I save the settings
    Then my profile should be private
    And my data should not be shared

  @privacy @data
  Scenario: Download my data
    Given I am on the "settings" page
    When I navigate to "Privacy"
    And I click "Download My Data"
    Then I should receive a data export file
    And the file should contain all my charts and settings

  @privacy @delete
  Scenario: Request account deletion
    Given I am on the "settings" page
    When I navigate to "Privacy"
    And I click "Delete Account"
    And I confirm the deletion
    Then I should see "Account scheduled for deletion"
    And I should receive a confirmation email

  # Theme and Display
  @theme @settings
  Scenario: Change theme to dark mode
    Given I am on the "settings" page
    When I navigate to "Display"
    And I select "Dark Mode"
    And I save the settings
    Then the app should use dark theme
    And my preference should be saved

  @theme @settings
  Scenario: Set default chart settings
    Given I am on the "settings" page
    When I navigate to "Charts"
    And I set default house system to "Whole Sign"
    And I set default zodiac to "Tropical"
    And I save the settings
    Then new charts should use these defaults

  # Connected Accounts
  @connected @social
  Scenario: Connect social accounts
    Given I am on the "settings" page
    When I navigate to "Connected Accounts"
    And I click "Connect Google"
    And I authorize the connection
    Then Google should be connected
    And I should be able to login with Google

  @connected @disconnect
  Scenario: Disconnect social account
    Given I have connected my Google account
    And I am on the "settings" page
    When I navigate to "Connected Accounts"
    And I click "Disconnect" next to Google
    And I confirm the disconnection
    Then Google should be disconnected
    And I should not be able to login with Google

  # Security Settings
  @security @2fa
  Scenario: Enable two-factor authentication
    Given I am on the "settings" page
    When I navigate to "Security"
    And I click "Enable 2FA"
    And I scan the QR code with my authenticator app
    And I enter the verification code
    Then 2FA should be enabled
    And I should receive backup codes

  @security @2fa
  Scenario: Login with 2FA
    Given I have 2FA enabled
    When I login with valid credentials
    Then I should see a 2FA prompt
    When I enter the correct code
    Then I should be logged in

  @security @sessions
  Scenario: View active sessions
    Given I am on the "settings" page
    When I navigate to "Security"
    And I click "Active Sessions"
    Then I should see all my logged-in devices
    And I should see login times and locations

  @security @sessions
  Scenario: Revoke a session
    Given I am viewing my active sessions
    When I click "Revoke" on a session
    Then that session should be logged out

  # Accessibility
  @profile @a11y
  Scenario: Profile page keyboard navigation
    Given I am on the "profile" page
    When I press "Tab" repeatedly
    Then I should be able to navigate all interactive elements
    And the focus order should be logical

  @profile @a11y
  Scenario: Settings screen reader accessible
    Given I am using a screen reader
    And I am on the "settings" page
    Then all settings should be properly announced
    And toggle states should be announced
