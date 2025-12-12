import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Zap, Target, Infinity, Crosshair, Lock } from 'lucide-react';
import { AdminCheats, ADMIN_PASSWORD } from '@/game/types';

interface AdminPanelProps {
  adminCheats: AdminCheats;
  onAdminCheatsChange: (cheats: AdminCheats) => void;
  playerId: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminCheats,
  onAdminCheatsChange,
  playerId,
}) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleUnlock = () => {
    if (password === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      setShowError(false);
      onAdminCheatsChange({
        ...adminCheats,
        enabled: true,
        playerId,
      });
    } else {
      setShowError(true);
    }
  };

  const toggleCheat = (key: keyof AdminCheats) => {
    if (typeof adminCheats[key] === 'boolean') {
      onAdminCheatsChange({
        ...adminCheats,
        [key]: !adminCheats[key],
      });
    }
  };

  const handleDisable = () => {
    onAdminCheatsChange({
      enabled: false,
      playerId: 0,
      godMode: false,
      instantKill: false,
      unlimitedBounces: false,
      superSpeed: false,
      rapidFire: false,
    });
    setIsUnlocked(false);
    setPassword('');
  };

  if (!isUnlocked) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10">
            <Lock className="h-4 w-4" />
            Admin
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Admin Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter the admin password to unlock cheats for Player {playerId}
            </p>
            <Input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              className="border-border"
            />
            {showError && (
              <p className="text-sm text-destructive">Incorrect password</p>
            )}
            <Button onClick={handleUnlock} className="w-full bg-destructive hover:bg-destructive/90">
              Unlock Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="game-panel space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider">
          Admin Cheats (P{playerId})
        </h3>
        <Button variant="ghost" size="sm" onClick={handleDisable} className="text-xs">
          Disable
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <Label htmlFor="godMode" className="text-sm">God Mode</Label>
          </div>
          <Switch
            id="godMode"
            checked={adminCheats.godMode}
            onCheckedChange={() => toggleCheat('godMode')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-red-400" />
            <Label htmlFor="instantKill" className="text-sm">Instant Kill</Label>
          </div>
          <Switch
            id="instantKill"
            checked={adminCheats.instantKill}
            onCheckedChange={() => toggleCheat('instantKill')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Infinity className="h-4 w-4 text-purple-400" />
            <Label htmlFor="unlimitedBounces" className="text-sm">Unlimited Bounces</Label>
          </div>
          <Switch
            id="unlimitedBounces"
            checked={adminCheats.unlimitedBounces}
            onCheckedChange={() => toggleCheat('unlimitedBounces')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <Label htmlFor="superSpeed" className="text-sm">Super Speed</Label>
          </div>
          <Switch
            id="superSpeed"
            checked={adminCheats.superSpeed}
            onCheckedChange={() => toggleCheat('superSpeed')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-orange-400" />
            <Label htmlFor="rapidFire" className="text-sm">Rapid Fire</Label>
          </div>
          <Switch
            id="rapidFire"
            checked={adminCheats.rapidFire}
            onCheckedChange={() => toggleCheat('rapidFire')}
          />
        </div>
      </div>
    </div>
  );
};
