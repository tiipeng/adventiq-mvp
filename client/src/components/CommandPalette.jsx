import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal, ModalBody, ModalFooter } from './ui/modal';
import { Input } from './ui/input';
import Badge from './ui/badge';

function baseActions(role) {
  const actions = [
    { id: 'experts', label: 'Go to Experts', to: '/experts', keywords: 'experts browse consultant', shortcut: 'g e' },
    { id: 'labs', label: 'Go to Labs', to: '/labs', keywords: 'labs facilities equipment', shortcut: 'g l' },
    { id: 'ai', label: 'Open AI Finder', to: '/ai-recommend', keywords: 'ai finder match recommendation', shortcut: 'g a' },
  ];

  if (!role) return actions;

  const dashboardMap = {
    business: '/dashboard/business',
    expert: '/dashboard/expert',
    lab: '/dashboard/lab',
    admin: '/dashboard/admin',
  };

  actions.push({ id: 'dashboard', label: 'Go to Dashboard', to: dashboardMap[role] || '/', keywords: 'dashboard home overview', shortcut: 'g d' });
  actions.push({ id: 'profile', label: 'Open Profile', to: '/profile', keywords: 'profile settings account', shortcut: 'g p' });

  if (role === 'business') {
    actions.push({ id: 'booking', label: 'New Booking', to: '/booking', keywords: 'book booking center create', shortcut: 'g b' });
    actions.push({ id: 'reports', label: 'Open Reports', to: '/reports', keywords: 'reports insights completed' });
  }

  if (role === 'expert' || role === 'lab') {
    actions.push({ id: 'reports-work', label: 'Open Reports', to: '/reports', keywords: 'reports submit completed' });
  }

  return actions;
}

export default function CommandPalette() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [keyPrefix, setKeyPrefix] = useState('');
  const prefixTimeoutRef = useRef(null);

  const actions = useMemo(() => baseActions(user?.role), [user?.role]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((action) => (`${action.label} ${action.keywords}`).toLowerCase().includes(q));
  }, [actions, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  function clearPrefixTimer() {
    if (prefixTimeoutRef.current) {
      clearTimeout(prefixTimeoutRef.current);
      prefixTimeoutRef.current = null;
    }
  }

  function setPrefixWithTimeout(next) {
    setKeyPrefix(next);
    clearPrefixTimer();
    prefixTimeoutRef.current = setTimeout(() => {
      setKeyPrefix('');
      prefixTimeoutRef.current = null;
    }, 900);
  }

  useEffect(() => {
    function onKeyDown(event) {
      const key = event.key.toLowerCase();
      const target = event.target;
      const typingInInput =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (open) {
        if (key === 'arrowdown') {
          event.preventDefault();
          setActiveIndex((prev) => (filtered.length === 0 ? 0 : Math.min(filtered.length - 1, prev + 1)));
          return;
        }
        if (key === 'arrowup') {
          event.preventDefault();
          setActiveIndex((prev) => Math.max(0, prev - 1));
          return;
        }
        if (key === 'enter' && filtered[activeIndex]) {
          event.preventDefault();
          runAction(filtered[activeIndex]);
          return;
        }
      }

      if (!open && !typingInInput) {
        if (key === '/') {
          event.preventDefault();
          window.dispatchEvent(new Event('focus-page-search'));
          return;
        }

        if (keyPrefix === 'g') {
          const roleDash = {
            business: '/dashboard/business',
            expert: '/dashboard/expert',
            lab: '/dashboard/lab',
            admin: '/dashboard/admin',
          };
          if (key === 'd') navigate(roleDash[user?.role] || '/');
          if (key === 'b' && user?.role === 'business') navigate('/booking');
          if (key === 'p') navigate('/profile');
          setKeyPrefix('');
          clearPrefixTimer();
          return;
        }

        if (key === 'g') {
          event.preventDefault();
          setPrefixWithTimeout('g');
          return;
        }
      }

      if (event.key === 'Escape') {
        setOpen(false);
        setKeyPrefix('');
        clearPrefixTimer();
      }
    }

    function onOpenPalette() {
      setOpen(true);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('open-command-palette', onOpenPalette);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('open-command-palette', onOpenPalette);
    };
  }, [open, filtered, activeIndex, keyPrefix, navigate, user?.role]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => () => clearPrefixTimer(), []);

  function runAction(action) {
    navigate(action.to);
    setOpen(false);
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} className="max-w-2xl overflow-hidden">
      <ModalBody className="border-b border-[var(--border)] p-3">
        <Input
          autoFocus
          placeholder="Search actions... (booking, profile, experts)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </ModalBody>

      <div className="max-h-[420px] overflow-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-3 text-sm text-[var(--text-muted)]">No matching actions.</p>
        ) : (
          filtered.map((action, index) => (
            <button
              key={action.id}
              type="button"
              onClick={() => runAction(action)}
              className={`w-full rounded-[10px] px-3 py-2 text-left text-sm transition-colors ${
                index === activeIndex
                  ? 'bg-[var(--accent-light)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{action.label}</span>
                {action.shortcut ? <Badge tone="gray">{action.shortcut}</Badge> : null}
              </div>
            </button>
          ))
        )}
      </div>

      <ModalFooter className="text-xs text-[var(--text-muted)]">
        Tips: <strong>Cmd/Ctrl + K</strong>, <strong>g d</strong> dashboard, <strong>g b</strong> booking, <strong>g p</strong> profile.
      </ModalFooter>
    </Modal>
  );
}
