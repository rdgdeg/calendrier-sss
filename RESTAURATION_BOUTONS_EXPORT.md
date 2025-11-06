# 🔄 Restauration des boutons d'export vers les calendriers

## 🎯 Problème identifié

Les boutons d'export vers les calendriers (Google, Outlook, ICS) avaient disparu des interfaces :
- ❌ Absents du modal EventModal
- ❌ Absents de la vue agenda AgendaView
- ❌ Fonctions d'export non implémentées dans Calendar.tsx

## ✅ Solutions apportées

### 1. Restauration dans EventModal.tsx

**Ajout de la section d'export :**
```typescript
{/* Boutons d'export */}
<div className="event-detail-row export-row">
  <div className="detail-icon">💾</div>
  <div className="detail-content">
    <strong>Ajouter à mon calendrier</strong>
    <div className="export-buttons">
      <button className="export-button google" onClick={() => onExportToGoogle(event)}>
        <span className="export-icon">📅</span>
        <span className="export-label">Google</span>
      </button>
      <button className="export-button outlook" onClick={() => onExportToOutlook(event)}>
        <span className="export-icon">📆</span>
        <span className="export-label">Outlook</span>
      </button>
      <button className="export-button ics" onClick={() => onExportToICS(event)}>
        <span className="export-icon">💾</span>
        <span className="export-label">Fichier ICS</span>
      </button>
    </div>
  </div>
</div>
```

**Props ajoutées :**
```typescript
interface EventModalProps {
  // ... props existantes
  onExportToGoogle?: (event: CalendarEvent) => void;
  onExportToOutlook?: (event: CalendarEvent) => void;
  onExportToICS?: (event: CalendarEvent) => void;
}
```

### 2. Ajout dans AgendaView.tsx

**Boutons d'export dans les détails étendus :**
```typescript
{/* Boutons d'export dans les détails étendus */}
<div className="event-detail-item export-actions">
  <span className="detail-icon">💾</span>
  <div className="detail-text">
    <div className="agenda-export-buttons">
      <button className="btn-agenda-export google" onClick={(e) => {
        e.stopPropagation();
        onExportToGoogle(event);
      }}>📅</button>
      <button className="btn-agenda-export outlook" onClick={(e) => {
        e.stopPropagation();
        onExportToOutlook(event);
      }}>📆</button>
      <button className="btn-agenda-export ics" onClick={(e) => {
        e.stopPropagation();
        onExportToICS(event);
      }}>💾</button>
    </div>
  </div>
</div>
```

**Props ajoutées :**
```typescript
interface AgendaViewProps {
  // ... props existantes
  onExportToGoogle?: (event: CalendarEvent) => void;
  onExportToOutlook?: (event: CalendarEvent) => void;
  onExportToICS?: (event: CalendarEvent) => void;
}
```

### 3. Implémentation des fonctions dans Calendar.tsx

**Export vers Google Calendar :**
```typescript
const exportToGoogle = (event: CalendarEvent) => {
  const startDate = event.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = event.end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const googleUrl = new URL('https://calendar.google.com/calendar/render');
  googleUrl.searchParams.set('action', 'TEMPLATE');
  googleUrl.searchParams.set('text', event.title);
  googleUrl.searchParams.set('dates', `${startDate}/${endDate}`);
  
  if (event.description) {
    googleUrl.searchParams.set('details', cleanHtmlContent(event.description));
  }
  
  if (event.location) {
    googleUrl.searchParams.set('location', event.location);
  }
  
  window.open(googleUrl.toString(), '_blank');
  showToast('success', 'Événement ouvert dans Google Calendar');
};
```

**Export vers Outlook :**
```typescript
const exportToOutlook = (event: CalendarEvent) => {
  const startDate = event.start.toISOString();
  const endDate = event.end.toISOString();
  
  const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
  outlookUrl.searchParams.set('subject', event.title);
  outlookUrl.searchParams.set('startdt', startDate);
  outlookUrl.searchParams.set('enddt', endDate);
  
  if (event.description) {
    outlookUrl.searchParams.set('body', cleanHtmlContent(event.description));
  }
  
  if (event.location) {
    outlookUrl.searchParams.set('location', event.location);
  }
  
  window.open(outlookUrl.toString(), '_blank');
  showToast('success', 'Événement ouvert dans Outlook');
};
```

**Export fichier ICS :**
```typescript
const exportToICS = (event: CalendarEvent) => {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  };
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UCLouvain//Calendrier SSS//FR',
    'BEGIN:VEVENT',
    `UID:${event.id}@calendrier-sss.uclouvain.be`,
    `DTSTART:${formatDate(event.start)}`,
    `DTEND:${formatDate(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeText(cleanHtmlContent(event.description))}` : '',
    event.location ? `LOCATION:${escapeText(event.location)}` : '',
    `CREATED:${formatDate(new Date())}`,
    `LAST-MODIFIED:${formatDate(new Date())}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n');
  
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  showToast('success', 'Fichier ICS téléchargé');
};
```

## 🎨 Styles CSS créés

### Fichier : `src/styles/export-buttons.css`

**Boutons dans le modal :**
- Design moderne avec dégradés de couleurs
- Effets de survol avec animations
- Responsive pour mobile
- Support du mode sombre

**Boutons dans l'agenda :**
- Format compact avec icônes
- Couleurs spécifiques par service
- Animations au survol
- Intégration harmonieuse

**Caractéristiques :**
- Glassmorphism et effets visuels modernes
- Transitions fluides
- Accessibilité (contraste élevé, réduction animations)
- Tooltips informatifs

## 🔧 Intégration technique

### Passage des props
```typescript
// Dans Calendar.tsx
const commonProps = {
  // ... autres props
  onExportToGoogle: exportToGoogle,
  onExportToOutlook: exportToOutlook,
  onExportToICS: exportToICS
};

// Passage aux composants enfants
<AgendaView {...commonProps} selectedEventId={selectedEvent?.id} />
<EventModal 
  event={selectedEvent}
  isOpen={isModalOpen}
  onClose={() => { /* ... */ }}
  onExportToGoogle={exportToGoogle}
  onExportToOutlook={exportToOutlook}
  onExportToICS={exportToICS}
/>
```

### Import CSS
```typescript
// Dans main.tsx
import './styles/export-buttons.css'
```

## 📱 Fonctionnalités

### Google Calendar
- Ouvre Google Calendar avec l'événement pré-rempli
- Inclut titre, dates, description et lieu
- Format de date compatible Google

### Outlook
- Ouvre Outlook Web avec l'événement pré-rempli
- Support des dates ISO
- Compatible Outlook.com et Office 365

### Fichier ICS
- Génère un fichier .ics standard
- Téléchargement automatique
- Compatible avec tous les clients de calendrier
- Nom de fichier basé sur le titre de l'événement

## 🎯 Résultats

### Avant
- ❌ Aucun bouton d'export visible
- ❌ Impossible d'ajouter les événements à son calendrier personnel
- ❌ Fonctionnalité manquante pour les utilisateurs

### Après
- ✅ Boutons d'export visibles dans le modal
- ✅ Boutons d'export dans la vue agenda (détails étendus)
- ✅ 3 options d'export : Google, Outlook, ICS
- ✅ Design moderne et cohérent
- ✅ Notifications de succès
- ✅ Support complet du mode sombre
- ✅ Responsive et accessible

## 🚀 Utilisation

1. **Dans le modal** : Cliquer sur un événement → Section "Ajouter à mon calendrier"
2. **Dans l'agenda** : Étendre les détails d'un événement → Boutons d'export compacts
3. **Choix du service** : Google Calendar, Outlook ou fichier ICS universel

Les boutons d'export sont maintenant pleinement fonctionnels et intégrés dans toute l'interface !